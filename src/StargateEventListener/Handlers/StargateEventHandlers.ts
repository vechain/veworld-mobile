import { ThorClient } from "@vechain/sdk-network"
import { Beat, Network } from "~Model"
import { AddressUtils, BloomUtils, debug, error } from "~Utils"
import { ERROR_EVENTS } from "~Constants"
import { getReceiptProcessor, InspectableOutput, ReceiptOutput } from "~Services/AbiService"
import { StargateConfiguration } from "~Hooks/useStargateConfig"

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
    refetchStargateData: (targetAddress?: string) => void
    managedAddresses: string[]
    selectedAccountAddress?: string
    stargateConfig: StargateConfiguration
}

export const handleNodeDelegatedEvent = async ({
    beat,
    network,
    thor,
    refetchStargateData,
    managedAddresses,
    selectedAccountAddress,
    stargateConfig,
}: NodeDelegatedEventHandlerProps) => {
    try {
        if (!stargateConfig || Object.keys(stargateConfig).length === 0) {
            debug(ERROR_EVENTS.STARGATE, `No Stargate configuration found for network: ${network.type}`)
            return
        }

        const stargateContracts = [
            stargateConfig.NODE_MANAGEMENT_CONTRACT_ADDRESS,
            stargateConfig.STARGATE_DELEGATION_CONTRACT_ADDRESS,
            stargateConfig.STARGATE_NFT_CONTRACT_ADDRESS,
            stargateConfig.LEGACY_NODES_CONTRACT_ADDRESS,
        ].filter((u): u is NonNullable<typeof u> => Boolean(u))

        // Check if beat might contain Stargate events using bloom filter
        const hasStargateContract = stargateContracts.some(contractAddress =>
            BloomUtils.testBloomForAddress(beat.bloom, beat.k, contractAddress),
        )

        if (!hasStargateContract) {
            return // No Stargate contracts in this beat
        }

        debug(ERROR_EVENTS.STARGATE, `Potential Stargate events in beat ${beat.number}`)

        // Parse NodeDelegated events from the beat (specifically from NodeManagement contract)
        const nodeManagementAddress = stargateConfig.NODE_MANAGEMENT_CONTRACT_ADDRESS
        if (!nodeManagementAddress) {
            debug(ERROR_EVENTS.STARGATE, `No NodeManagement contract address found for network: ${network.type}`)
            return
        }

        // Create a receipt processor for this network. Only Generic manager is needed here
        const receiptProcessor = getReceiptProcessor(network.type, ["Generic"])

        const nodeDelegatedEvents = await parseNodeDelegatedEvents(beat, nodeManagementAddress, thor, receiptProcessor)

        // Filter events where either the owner or delegatee is an address managed in VeWorld
        const relevantEvents = nodeDelegatedEvents.filter(evt =>
            managedAddresses.some(
                addr =>
                    AddressUtils.compareAddresses(addr, evt.owner) ||
                    AddressUtils.compareAddresses(addr, evt.delegatee),
            ),
        )

        if (relevantEvents.length > 0) {
            debug(
                ERROR_EVENTS.STARGATE,
                `Found ${relevantEvents.length} NodeDelegated events in beat ${beat.number} for managed addresses`,
            )

            const uniqueAddresses = new Set<string>()

            // Process each event for logging and collect unique addresses
            for (const eventData of relevantEvents) {
                debug(ERROR_EVENTS.STARGATE, "Processing NodeDelegated event:", {
                    nodeId: eventData.nodeId,
                    delegatee: eventData.delegatee,
                    isDelegated: eventData.isDelegated,
                    blockNumber: eventData.blockNumber,
                    txId: eventData.txId,
                    owner: eventData.owner,
                })

                // Add owner address
                uniqueAddresses.add(eventData.owner.toLowerCase())

                // Add delegatee address if different from owner
                if (!AddressUtils.compareAddresses(eventData.delegatee, eventData.owner)) {
                    uniqueAddresses.add(eventData.delegatee.toLowerCase())
                }
            }

            // Refetch data once per unique address with a delay to allow blockchain state to propagate
            // Only refetch for the selected account to avoid unnecessary network calls
            setTimeout(() => {
                uniqueAddresses.forEach(address => {
                    if (!selectedAccountAddress || AddressUtils.compareAddresses(address, selectedAccountAddress)) {
                        debug(ERROR_EVENTS.STARGATE, "Refetching Stargate data for address:", address)
                        refetchStargateData(address)
                    } else {
                        debug(ERROR_EVENTS.STARGATE, "Skipping refetch for non-selected address:", address)
                    }
                })
            }, 500)
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
    // Analyze each transaction once, then flatten all outputs to events.
    const analyzedPerTx: { origin: string; outputs: ReceiptOutput[] }[] = []

    for (const tx of transactions) {
        try {
            const origin = tx.origin ?? ""
            const analyzed = receiptProcessor.analyzeReceipt(tx.outputs, origin)
            analyzedPerTx.push({ origin, outputs: analyzed })
        } catch (txError) {
            debug(ERROR_EVENTS.STARGATE, "Error processing transaction", txError)
        }
    }

    return analyzedPerTx.flatMap(({ origin, outputs }) =>
        outputs
            .filter(isNodeDelegatedOutput)
            .filter(out => AddressUtils.compareAddresses(out.address, nodeManagementContract))
            .map(out => {
                return {
                    nodeId: String(out.params.nodeId),
                    delegatee: out.params.delegatee,
                    isDelegated: Boolean(out.params.delegated),
                    blockNumber: beat.number,
                    txId: "",
                    contractAddress: nodeManagementContract,
                    owner: origin,
                } satisfies NodeDelegatedEventData
            }),
    )
}
