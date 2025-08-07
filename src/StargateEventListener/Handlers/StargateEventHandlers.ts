import { abi } from "thor-devkit"
import { ThorClient } from "@vechain/sdk-network"
import { Beat, Network } from "~Model"
import { BloomUtils, debug, error } from "~Utils"
import { ERROR_EVENTS } from "~Constants"
import { getStargateNetworkConfig } from "~Constants/Constants/Staking"

// NodeDelegated event ABI - event NodeDelegated(uint256 indexed nodeId, address indexed delegatee, bool indexed isDelegated)
const NODE_DELEGATED_EVENT_ABI = {
    anonymous: false,
    inputs: [
        { indexed: true, internalType: "uint256", name: "nodeId", type: "uint256" },
        { indexed: true, internalType: "address", name: "delegatee", type: "address" },
        { indexed: true, internalType: "bool", name: "isDelegated", type: "bool" },
    ],
    name: "NodeDelegated",
    type: "event" as const,
}

// Calculate event signature hash
const NODE_DELEGATED_EVENT_SIGNATURE = new abi.Event(NODE_DELEGATED_EVENT_ABI).signature

interface NodeDelegatedEventData {
    nodeId: string
    delegatee: string
    isDelegated: boolean
    blockNumber: number
    txId: string
    contractAddress: string
}

interface NodeDelegatedEventHandlerProps {
    beat: Beat
    network: Network
    thor: ThorClient
    refetchStargateData: () => void
}

export const handleNodeDelegatedEvent = async ({
    beat,
    network,
    thor,
    refetchStargateData,
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

        const nodeDelegatedEvents = await parseNodeDelegatedEvents(beat, nodeManagementAddress, thor)

        if (nodeDelegatedEvents.length > 0) {
            debug(
                ERROR_EVENTS.STARGATE,
                `Found ${nodeDelegatedEvents.length} NodeDelegated events in beat ${beat.number}`,
            )

            // Process each event
            for (const eventData of nodeDelegatedEvents) {
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
): Promise<NodeDelegatedEventData[]> => {
    const events: NodeDelegatedEventData[] = []

    try {
        // Fetch the block details using the beat ID
        const block = await thor.blocks.getBlockCompressed(beat.id)

        if (!block || !block.transactions) {
            debug(ERROR_EVENTS.STARGATE, `No transactions found in block ${beat.number}`)
            return events
        }

        // Process each transaction in the block
        for (const txId of block.transactions) {
            try {
                // Fetch transaction receipt to get event logs
                const receipt = await thor.transactions.getTransactionReceipt(txId)

                if (!receipt?.outputs) continue

                // Process each output in the transaction
                for (const output of receipt.outputs) {
                    if (!output.events) continue

                    // Process each event in the output
                    for (const event of output.events) {
                        // Check if this is a NodeDelegated event from the correct contract
                        if (
                            event.address?.toLowerCase() === nodeManagementContract.toLowerCase() &&
                            event.topics?.[0]?.toLowerCase() === NODE_DELEGATED_EVENT_SIGNATURE.toLowerCase()
                        ) {
                            const decoded = decodeNodeDelegatedEvent(event)
                            if (decoded) {
                                events.push({
                                    ...decoded,
                                    blockNumber: beat.number,
                                    txId,
                                    contractAddress: nodeManagementContract,
                                })

                                debug(
                                    ERROR_EVENTS.STARGATE,
                                    `Found NodeDelegated event: nodeId=${decoded.nodeId}, ` +
                                        `delegatee=${decoded.delegatee}, isDelegated=${decoded.isDelegated}`,
                                )
                            }
                        }
                    }
                }
            } catch (txError) {
                // Continue processing other transactions if one fails
                debug(ERROR_EVENTS.STARGATE, `Error processing transaction ${txId}:`, txError)
            }
        }

        debug(ERROR_EVENTS.STARGATE, `Parsed ${events.length} NodeDelegated events from beat ${beat.number}`)
    } catch (err) {
        error(ERROR_EVENTS.STARGATE, "Error parsing NodeDelegated events:", err)
    }

    return events
}

/**
 * Decode a NodeDelegated event from VeChain event logs
 */
const decodeNodeDelegatedEvent = (event: {
    topics: string[]
    data: string
}): Omit<NodeDelegatedEventData, "blockNumber" | "txId" | "contractAddress"> | null => {
    try {
        if (event.topics[0]?.toLowerCase() !== NODE_DELEGATED_EVENT_SIGNATURE.toLowerCase()) {
            return null
        }

        const decoded = new abi.Event(NODE_DELEGATED_EVENT_ABI).decode(event.data, event.topics)

        return {
            nodeId: decoded.nodeId.toString(),
            delegatee: decoded.delegatee,
            isDelegated: decoded.isDelegated,
        }
    } catch (err) {
        error(ERROR_EVENTS.STARGATE, "Failed to decode NodeDelegated event:", err)
        return null
    }
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
