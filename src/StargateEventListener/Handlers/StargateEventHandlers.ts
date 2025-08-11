import { ThorClient } from "@vechain/sdk-network"
import { Beat, Network } from "~Model"
import { AddressUtils, BloomUtils, debug, error } from "~Utils"
import { ERROR_EVENTS } from "~Constants"
import { getStargateNetworkConfig } from "~Constants/Constants/Staking"
import { getReceiptProcessor, InspectableOutput, ReceiptOutput } from "~Services/AbiService"

// Signature used by Generated ABI map for GenericAbiManager
const NODE_DELEGATED_EVENT_SIGNATURE_NAME = "NodeDelegated(indexed uint256,indexed address,bool)"

const isNodeDelegatedOutput = (
    out: ReceiptOutput,
): out is Extract<ReceiptOutput, { name: typeof NODE_DELEGATED_EVENT_SIGNATURE_NAME }> =>
    out.name === NODE_DELEGATED_EVENT_SIGNATURE_NAME

interface NodeDelegatedEventData {
    nodeId: string
    delegatee: string
    isDelegated: boolean
    blockNumber: number
    txId: string
    contractAddress: string
    owner: string
}

interface NodeDelegatedEventHandlerProps {
    beat: Beat
    network: Network
    thor: ThorClient
    refetchStargateData: () => void
    managedAddresses: string[]
}

export const handleNodeDelegatedEvent = async ({
    beat,
    network,
    thor,
    refetchStargateData,
    managedAddresses,
}: NodeDelegatedEventHandlerProps) => {
    try {
        // Get Stargate contract addresses for the current network
        const networkConfig = getStargateNetworkConfig(network.type)

        if (!networkConfig) {
            debug(ERROR_EVENTS.STARGATE, `No Stargate configuration found for network: ${network.type}`)
            return
        }

        const stargateContracts = [
            networkConfig.NODE_MANAGEMENT_CONTRACT_ADDRESS,
            networkConfig.STARGATE_DELEGATION_CONTRACT_ADDRESS,
            networkConfig.STARGATE_NFT_CONTRACT_ADDRESS,
            networkConfig.LEGACY_NODES_CONTRACT_ADDRESS,
        ].filter(Boolean)

        // Check if beat might contain Stargate events using bloom filter
        const hasStargateContract = stargateContracts.some(contractAddress =>
            BloomUtils.testBloomForAddress(beat.bloom, beat.k, contractAddress),
        )

        if (!hasStargateContract) {
            return // No Stargate contracts in this beat
        }

        debug(ERROR_EVENTS.STARGATE, `Potential Stargate events in beat ${beat.number}`)

        // Parse NodeDelegated events from the beat (specifically from NodeManagement contract)
        const nodeManagementAddress = networkConfig.NODE_MANAGEMENT_CONTRACT_ADDRESS
        if (!nodeManagementAddress) {
            debug(ERROR_EVENTS.STARGATE, `No NodeManagement contract address found for network: ${network.type}`)
            return
        }

        // Create a receipt processor for this network. Only Generic manager is needed here
        const receiptProcessor = getReceiptProcessor(network.type, ["Generic"])

        const nodeDelegatedEvents = await parseNodeDelegatedEvents(beat, nodeManagementAddress, thor, receiptProcessor)

        // Filter only events where the tx origin (node owner) is an address managed in VeWorld
        const ownedEvents = nodeDelegatedEvents.filter(evt =>
            managedAddresses.some(addr => AddressUtils.compareAddresses(addr, evt.owner)),
        )

        if (ownedEvents.length > 0) {
            debug(
                ERROR_EVENTS.STARGATE,
                `Found ${ownedEvents.length} NodeDelegated events in beat ${beat.number} for managed addresses`,
            )

            // Process each event
            for (const eventData of ownedEvents) {
                await processNodeDelegatedEvent(eventData, refetchStargateData)
            }
        }
    } catch (err) {
        error(ERROR_EVENTS.STARGATE, "Error handling NodeDelegated event:", err)
    }
}

/**
 * Parse NodeDelegated events from a beat
 */
const parseNodeDelegatedEvents = async (
    beat: Beat,
    nodeManagementContract: string,
    thor: ThorClient,
    receiptProcessor: ReturnType<typeof getReceiptProcessor>,
): Promise<NodeDelegatedEventData[]> => {
    try {
        const expanded = await thor.blocks.getBlockExpanded(beat.id)

        if (!expanded?.transactions || expanded.transactions.length === 0) {
            debug(ERROR_EVENTS.STARGATE, `No transactions found in block ${beat.number}`)
            return []
        }

        const events: NodeDelegatedEventData[] = processExpandedTransactionsForEvents(
            expanded.transactions.map(tx => ({ id: tx.id, origin: tx.origin, outputs: tx.outputs })),
            nodeManagementContract,
            beat,
            receiptProcessor,
        )
        debug(ERROR_EVENTS.STARGATE, `Parsed ${events.length} NodeDelegated events from beat ${beat.number}`)

        return events
    } catch (err) {
        error(ERROR_EVENTS.STARGATE, "Error parsing NodeDelegated events:", err)
        return []
    }
}

/**
 * Process all transactions in a block to find NodeDelegated events
 */
type ExpandedTx = {
    id: string
    origin?: string
    outputs: InspectableOutput[]
}

const processExpandedTransactionsForEvents = (
    transactions: ExpandedTx[],
    nodeManagementContract: string,
    beat: Beat,
    receiptProcessor: ReturnType<typeof getReceiptProcessor>,
): NodeDelegatedEventData[] => {
    const events: NodeDelegatedEventData[] = []

    for (const tx of transactions) {
        try {
            const transactionEvents = processExpandedTransactionForEvents(
                tx,
                nodeManagementContract,
                beat,
                receiptProcessor,
            )
            events.push(...transactionEvents)
        } catch (txError) {
            debug(ERROR_EVENTS.STARGATE, "Error processing transaction", txError)
        }
    }

    return events
}

const processExpandedTransactionForEvents = (
    tx: ExpandedTx,
    nodeManagementContract: string,
    beat: Beat,
    receiptProcessor: ReturnType<typeof getReceiptProcessor>,
): NodeDelegatedEventData[] => {
    const txId = tx.id
    const txOrigin = tx.origin ?? ""
    const outputs = tx.outputs

    if (!outputs || outputs.length === 0) return []

    const analyzedOutputs = receiptProcessor.analyzeReceipt(outputs, txOrigin)
    const found: NodeDelegatedEventData[] = analyzedOutputs
        .filter(isNodeDelegatedOutput)
        .filter(out => out.address?.toLowerCase() === nodeManagementContract.toLowerCase())
        .map(out => {
            return {
                nodeId: String(out.params.nodeId),
                delegatee: out.params.delegatee,
                isDelegated: Boolean(out.params.delegated),
                blockNumber: beat.number,
                txId,
                contractAddress: nodeManagementContract,
                owner: txOrigin,
            } satisfies NodeDelegatedEventData
        })

    return found
}

/**
 * Process a single NodeDelegated event
 */
const processNodeDelegatedEvent = async (eventData: NodeDelegatedEventData, refetchStargateData: () => void) => {
    try {
        debug(ERROR_EVENTS.STARGATE, "Processing NodeDelegated event:", {
            nodeId: eventData.nodeId,
            delegatee: eventData.delegatee,
            isDelegated: eventData.isDelegated,
            blockNumber: eventData.blockNumber,
            txId: eventData.txId,
            owner: eventData.owner,
        })

        // Add a small delay to allow blockchain state to propagate before refetching
        setTimeout(() => {
            // Trigger refetch of Stargate data for the node owner (current account)
            refetchStargateData()

            // Also invalidate queries for the delegatee account if it's different from current account
            if (eventData.delegatee !== eventData.owner) {
                debug(ERROR_EVENTS.STARGATE, "Also invalidating queries for delegatee:", eventData.delegatee)
                refetchStargateData()
            }
        }, 2000)
    } catch (err) {
        error(ERROR_EVENTS.STARGATE, "Error processing NodeDelegated event:", err)
    }
}
