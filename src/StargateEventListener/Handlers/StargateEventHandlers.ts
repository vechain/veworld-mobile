import { ThorClient } from "@vechain/sdk-network"
import { Beat, Network } from "~Model"
import { AddressUtils, BloomUtils, debug, error } from "~Utils"
import { ERROR_EVENTS } from "~Constants"
import { getReceiptProcessor, InspectableOutput, ReceiptOutput } from "~Services/AbiService"
import { StargateConfiguration } from "~Hooks/useStargateConfig"

const isStargateOutput = (out: ReceiptOutput) =>
    out.name === "NodeDelegated(indexed uint256,indexed address,bool)" ||
    out.name === "ClaimGeneratedVTHO(address,address,uint256)" ||
    out.name === "TokenMinted(indexed address,indexed uint8,indexed bool,uint256,uint256)" ||
    out.name === "Transfer(indexed address,indexed address,indexed uint256)" ||
    out.name === "TokenBurned(indexed address,indexed uint8,uint256,uint256)" ||
    //New contract
    out.name === "DelegationRewardsClaimed(indexed address,indexed uint256,indexed uint256,uint256,uint32,uint32)" ||
    out.name === "Unstaked(indexed address,indexed address,indexed uint256)" ||
    //Old contract
    out.name === "DelegationRewardsClaimed(indexed uint256,uint256,indexed address,indexed address)"

interface NodeDelegatedEventHandlerProps {
    beat: Beat
    network: Network
    thor: ThorClient
    invalidateStargateData: (addresses: string[]) => void
    managedAddresses: string[]
    selectedAccountAddress?: string
    stargateConfig: StargateConfiguration
}

export const handleNodeDelegatedEvent = async ({
    beat,
    network,
    thor,
    invalidateStargateData,
    managedAddresses,
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
            stargateConfig.STARGATE_CONTRACT_ADDRESS,
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

        const stargateEvents = await parseStargateEvents(beat, stargateConfig, thor, receiptProcessor)

        // Get all the unique addresses
        const addresses = [...new Set(stargateEvents.flatMap(u => [u.address1, u.address2].filter(Boolean)))]
            //Filter only by the addresses owned by the user
            .filter(addr => managedAddresses.some(managedAddr => AddressUtils.compareAddresses(addr, managedAddr)))
        if (addresses.length === 0) return
        setTimeout(() => {
            invalidateStargateData(addresses as string[])
        }, 500)
    } catch (err) {
        error(ERROR_EVENTS.STARGATE, "Error handling NodeDelegated event:", err)
    }
}

/**
 * Parse NodeDelegated events from a beat
 */
const parseStargateEvents = async (
    beat: Beat,
    config: StargateConfiguration,
    thor: ThorClient,
    receiptProcessor: ReturnType<typeof getReceiptProcessor>,
) => {
    try {
        const expanded = await thor.blocks.getBlockExpanded(beat.id)

        if (!expanded?.transactions || expanded.transactions.length === 0) {
            debug(ERROR_EVENTS.STARGATE, `No transactions found in block ${beat.number}`)
            return []
        }

        const events = processExpandedTransactionsForEvents(
            expanded.transactions.map(tx => ({ id: tx.id, origin: tx.origin, outputs: tx.outputs })),
            config,
            beat,
            receiptProcessor,
        )

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
    config: StargateConfiguration,
    beat: Beat,
    receiptProcessor: ReturnType<typeof getReceiptProcessor>,
) => {
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

    return analyzedPerTx.flatMap(({ outputs }) =>
        outputs
            .filter(isStargateOutput)
            .filter(
                out =>
                    AddressUtils.compareAddresses(out.address, config.NODE_MANAGEMENT_CONTRACT_ADDRESS) ||
                    AddressUtils.compareAddresses(out.address, config.STARGATE_CONTRACT_ADDRESS) ||
                    AddressUtils.compareAddresses(out.address, config.STARGATE_NFT_CONTRACT_ADDRESS) ||
                    AddressUtils.compareAddresses(out.address, config.STARGATE_DELEGATION_CONTRACT_ADDRESS!),
            )
            .map(out => {
                switch (out.name) {
                    case "Transfer(indexed address,indexed address,indexed uint256)":
                        return { address1: out.params.from, address2: out.params.to, tokenId: out.params.tokenId }
                    case "TokenBurned(indexed address,indexed uint8,uint256,uint256)":
                        return { address1: out.params.owner, tokenId: out.params.tokenId }
                    case "TokenMinted(indexed address,indexed uint8,indexed bool,uint256,uint256)":
                        return { address1: out.params.owner, tokenId: out.params.tokenId }
                    // eslint-disable-next-line max-len
                    case "DelegationRewardsClaimed(indexed address,indexed uint256,indexed uint256,uint256,uint32,uint32)":
                        return { address1: out.params.receiver, tokenId: out.params.tokenId }
                    case "ClaimGeneratedVTHO(address,address,uint256)":
                        return { address1: out.params.owner, address2: out.params.receiver }
                    case "NodeDelegated(indexed uint256,indexed address,bool)":
                        return { tokenId: out.params.nodeId }
                    case "Unstaked(indexed address,indexed address,indexed uint256)":
                        return { address1: out.params.owner, tokenId: out.params.tokenId }
                    case "DelegationRewardsClaimed(indexed uint256,uint256,indexed address,indexed address)":
                        return {
                            address1: out.params.claimer,
                            address2: out.params.recipient,
                            tokenId: out.params.tokenId,
                        }
                }
            }),
    )
}
