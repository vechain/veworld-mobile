import { ThorClient } from "@vechain/sdk-network"
import { Beat, Network } from "~Model"
import { AddressUtils, BloomUtils, debug, error } from "~Utils"
import { ERROR_EVENTS } from "~Constants"
import { getStargateNetworkConfig } from "~Constants/Constants/Staking"
import { getReceiptProcessor, InspectableOutput, ReceiptOutput } from "~Services/AbiService"

// Signature used by Generated ABI map for GenericAbiManager
const NODE_DELEGATED_EVENT_SIGNATURE_NAME = "NodeDelegated(indexed uint256,indexed address,bool)"

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
        // Prefer expanded block to avoid per-transaction receipt calls
        const expanded = await thor.blocks.getBlockExpanded(beat.id)

        let events: NodeDelegatedEventData[] = []
        if (expanded?.transactions) {
            events = await processExpandedTransactionsForEvents(
                expanded.transactions.map(tx => ({ id: tx.id, origin: tx.origin, outputs: tx.outputs })),
                nodeManagementContract,
                beat,
                receiptProcessor,
            )
        } else {
            const compressed = await thor.blocks.getBlockCompressed(beat.id)
            if (!compressed?.transactions) {
                debug(ERROR_EVENTS.STARGATE, `No transactions found in block ${beat.number}`)
                return []
            }
            events = await processTransactionIdsForEvents(
                compressed.transactions,
                nodeManagementContract,
                thor,
                beat,
                receiptProcessor,
            )
        }
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

const processExpandedTransactionsForEvents = async (
    transactions: ExpandedTx[],
    nodeManagementContract: string,
    beat: Beat,
    receiptProcessor: ReturnType<typeof getReceiptProcessor>,
): Promise<NodeDelegatedEventData[]> => {
    const events: NodeDelegatedEventData[] = []

    for (const tx of transactions) {
        try {
            const transactionEvents = await processExpandedTransactionForEvents(
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

const processTransactionIdsForEvents = async (
    transactions: string[],
    nodeManagementContract: string,
    thor: ThorClient,
    beat: Beat,
    receiptProcessor: ReturnType<typeof getReceiptProcessor>,
): Promise<NodeDelegatedEventData[]> => {
    const events: NodeDelegatedEventData[] = []

    for (const txId of transactions) {
        try {
            const transactionEvents = await processTransactionForEvents(
                txId,
                nodeManagementContract,
                thor,
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

/**
 * Process a single transaction to find NodeDelegated events
 */
const processExpandedTransactionForEvents = async (
    tx: ExpandedTx,
    nodeManagementContract: string,
    beat: Beat,
    receiptProcessor: ReturnType<typeof getReceiptProcessor>,
): Promise<NodeDelegatedEventData[]> => {
    const txId = tx.id
    const txOrigin = tx.origin ?? ""
    const outputs = tx.outputs

    if (!outputs || outputs.length === 0) return []

    const analyzedOutputs = receiptProcessor.analyzeReceipt(outputs, txOrigin)
    const found: NodeDelegatedEventData[] = analyzedOutputs
        .filter(
            (out: ReceiptOutput) =>
                out.name === NODE_DELEGATED_EVENT_SIGNATURE_NAME &&
                out.address?.toLowerCase() === nodeManagementContract.toLowerCase(),
        )
        .map(out => {
            const params: any = (out as any).params
            return {
                nodeId: params.nodeId?.toString?.() ?? String(params.nodeId),
                delegatee: params.delegatee,
                isDelegated: Boolean(params.delegated ?? params.isDelegated),
                blockNumber: beat.number,
                txId,
                contractAddress: nodeManagementContract,
                owner: txOrigin,
            } satisfies NodeDelegatedEventData
        })

    return found
}

const processTransactionForEvents = async (
    txId: string,
    nodeManagementContract: string,
    thor: ThorClient,
    beat: Beat,
    receiptProcessor: ReturnType<typeof getReceiptProcessor>,
): Promise<NodeDelegatedEventData[]> => {
    const receipt = await thor.transactions.getTransactionReceipt(txId)

    if (!receipt?.outputs) {
        return []
    }

    const txOrigin = receipt.meta.txOrigin ?? ""
    const analyzedOutputs = receiptProcessor.analyzeReceipt(receipt.outputs as unknown as InspectableOutput[], txOrigin)
    const found: NodeDelegatedEventData[] = analyzedOutputs
        .filter(
            (out: ReceiptOutput) =>
                out.name === NODE_DELEGATED_EVENT_SIGNATURE_NAME &&
                out.address?.toLowerCase() === nodeManagementContract.toLowerCase(),
        )
        .map(out => {
            const params: any = (out as any).params
            return {
                nodeId: params.nodeId?.toString?.() ?? String(params.nodeId),
                delegatee: params.delegatee,
                isDelegated: Boolean(params.delegated ?? params.isDelegated),
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
        })

        // Trigger refetch of Stargate data
        // This will automatically update UI components (StakedCard, AccountFiatBalance, etc.)
        refetchStargateData()
    } catch (err) {
        error(ERROR_EVENTS.STARGATE, "Error processing NodeDelegated event:", err)
    }
}
