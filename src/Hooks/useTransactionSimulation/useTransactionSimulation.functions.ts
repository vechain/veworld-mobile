import { abi } from "thor-devkit"
import { abis } from "~Constants"
import { AddressUtils, BigNutils } from "~Utils"
import {
    ActivityType,
    NFTTransferOutput,
    SwapOutput,
    SwapType,
    TokenAllowanceOutput,
    TokenTransferOutput,
    TransactionSimulationOutputType,
    TransferType,
    VetTransferOutput,
} from "./useTransactionSimulation.types"

const APPROVAL_EVENT = new abi.Event(abis.VIP180.ApprovalEvent)
const TRANSFER_EVENT = new abi.Event(abis.VIP180.TransferEvent)
const NFT_TRANSFER_EVENT = new abi.Event(abis.VIP181.TransferEvent)
const SWAP_EVENT = new abi.Event(abis.UniswapPairV2.SwapEvent)

const parseTokenTransferEvent = (evt: Connex.VM.Event, userAddress: string): TokenTransferOutput => {
    const decoded = TRANSFER_EVENT.decode(evt.data, evt.topics)
    return {
        kind: TransactionSimulationOutputType.TOKEN_TRANSFER,
        amount: BigNutils(decoded.value).bn,
        recipient: decoded.to,
        sender: decoded.from,
        tokenAddress: evt.address,
        transferType: AddressUtils.compareAddresses(decoded.to, userAddress) ? TransferType.RECEIVE : TransferType.SEND,
    }
}

const parseNFTTransferEvent = (evt: Connex.VM.Event, userAddress: string): NFTTransferOutput => {
    const decoded = NFT_TRANSFER_EVENT.decode(evt.data, evt.topics)
    return {
        kind: TransactionSimulationOutputType.NFT_TRANSFER,
        tokenId: BigNutils(decoded.tokenId).bn,
        recipient: decoded.to,
        sender: decoded.from,
        tokenAddress: evt.address,
        transferType: AddressUtils.compareAddresses(decoded.to, userAddress) ? TransferType.RECEIVE : TransferType.SEND,
    }
}

const parseTransferEvent = (evt: Connex.VM.Event, userAddress: string) => {
    if (evt.topics.length === 3) return parseTokenTransferEvent(evt, userAddress)
    return parseNFTTransferEvent(evt, userAddress)
}

const parseTokenApprovalEvent = (evt: Connex.VM.Event): TokenAllowanceOutput => {
    const decoded = APPROVAL_EVENT.decode(evt.data, evt.topics)
    return {
        kind: TransactionSimulationOutputType.TOKEN_ALLOWANCE,
        amount: BigNutils(decoded.value).bn,
        owner: decoded.owner,
        spender: decoded.spender,
        tokenAddress: evt.address,
    }
}

const parseVetTransfer = (transfer: Connex.VM.Transfer, userAddress: string): VetTransferOutput => {
    return {
        kind: TransactionSimulationOutputType.VET_TRANSFER,
        amount: BigNutils(transfer.amount).bn,
        recipient: transfer.recipient,
        sender: transfer.sender,
        transferType: AddressUtils.compareAddresses(userAddress, transfer.sender)
            ? TransferType.SEND
            : TransferType.RECEIVE,
    }
}

type SwapParser = (
    events: Connex.VM.Event[],
    transfers: Connex.VM.Transfer[],
    userAddress: string,
) => (SwapOutput & { transfersToRemove: Connex.VM.Transfer[]; eventsToRemove: Connex.VM.Event[] }) | null

/**
 * Check if an event is an ERC-20 Transfer event. Checks the number of topics to differentiate it from ERC-721 Transfer
 * @param event Event
 * @returns True if it's an ERC-20 Transfer event, false otherwise
 */
const isFungibleTransferEvent = (event: Connex.VM.Event) => {
    return event.topics[0].toLowerCase() === TRANSFER_EVENT.signature.toLowerCase() && event.topics.length === 3
}

const parseSwapVETForTokens: SwapParser = (events, transfers, userAddress) => {
    const inputTransfer = transfers.find(tsf => AddressUtils.compareAddresses(tsf.sender, userAddress))
    if (!inputTransfer) return null
    const outputTransferEvent = events.find(event => {
        return (
            isFungibleTransferEvent(event) &&
            AddressUtils.compareAddresses(TRANSFER_EVENT.decode(event.data, event.topics).to, userAddress)
        )
    })
    if (!outputTransferEvent) return null
    const decodedOutputTransferEvent = TRANSFER_EVENT.decode(outputTransferEvent.data, outputTransferEvent.topics)
    const swapEvent = events.find(event => {
        return (
            event.topics[0].toLowerCase() === SWAP_EVENT.signature.toLowerCase() &&
            AddressUtils.compareAddresses(SWAP_EVENT.decode(event.data, event.topics).to, userAddress)
        )
    })
    if (!swapEvent) return null
    if (!AddressUtils.compareAddresses(inputTransfer.sender, decodedOutputTransferEvent.to)) return null

    return {
        amountIn: BigNutils(inputTransfer.amount).bn,
        amountOut: BigNutils(decodedOutputTransferEvent.value).bn,
        kind: TransactionSimulationOutputType.SWAP,
        wallet: inputTransfer.sender,
        swapType: SwapType.VET_TO_FT,
        toToken: outputTransferEvent.address,
        transfersToRemove: [inputTransfer],
        eventsToRemove: [outputTransferEvent],
    }
}

const parseSwapTokensForVET: SwapParser = (events, transfers, userAddress) => {
    const outputTransfer = transfers.find(tsf => AddressUtils.compareAddresses(tsf.recipient, userAddress))
    if (!outputTransfer) return null
    const inputTransferEvent = events.find(event => {
        return (
            isFungibleTransferEvent(event) &&
            AddressUtils.compareAddresses(TRANSFER_EVENT.decode(event.data, event.topics).from, userAddress)
        )
    })
    if (!inputTransferEvent) return null
    const decodedInputTransferEvent = TRANSFER_EVENT.decode(inputTransferEvent.data, inputTransferEvent.topics)
    const swapEvent = events.find(event => {
        return event.topics[0].toLowerCase() === SWAP_EVENT.signature.toLowerCase()
    })
    if (!swapEvent) return null
    if (!AddressUtils.compareAddresses(outputTransfer.recipient, decodedInputTransferEvent.from)) return null

    return {
        amountIn: BigNutils(decodedInputTransferEvent.value).bn,
        amountOut: BigNutils(outputTransfer.amount).bn,
        kind: TransactionSimulationOutputType.SWAP,
        wallet: decodedInputTransferEvent.from,
        swapType: SwapType.FT_TO_VET,
        fromToken: inputTransferEvent.address,
        transfersToRemove: [outputTransfer],
        eventsToRemove: [inputTransferEvent],
    }
}

const parseSwapTokensForTokens: SwapParser = (events, transfers, userAddress) => {
    const inputTransferEvent = events.find(event => {
        return (
            isFungibleTransferEvent(event) &&
            AddressUtils.compareAddresses(TRANSFER_EVENT.decode(event.data, event.topics).from, userAddress)
        )
    })
    if (!inputTransferEvent) return null
    const decodedInputTransferEvent = TRANSFER_EVENT.decode(inputTransferEvent.data, inputTransferEvent.topics)
    const outputTransferEvent = events.find(event => {
        return (
            isFungibleTransferEvent(event) &&
            AddressUtils.compareAddresses(TRANSFER_EVENT.decode(event.data, event.topics).to, userAddress)
        )
    })
    if (!outputTransferEvent) return null
    const decodedOutputTransferEvent = TRANSFER_EVENT.decode(outputTransferEvent.data, outputTransferEvent.topics)
    const swapEvent = events.find(event => {
        return (
            event.topics[0].toLowerCase() === SWAP_EVENT.signature.toLowerCase() &&
            AddressUtils.compareAddresses(SWAP_EVENT.decode(event.data, event.topics).to, userAddress)
        )
    })
    if (!swapEvent) return null
    if (!AddressUtils.compareAddresses(decodedInputTransferEvent.from, decodedOutputTransferEvent.to)) return null
    if (AddressUtils.compareAddresses(inputTransferEvent.address, outputTransferEvent.address)) return null

    return {
        amountIn: BigNutils(decodedInputTransferEvent.value).bn,
        amountOut: BigNutils(decodedOutputTransferEvent.value).bn,
        kind: TransactionSimulationOutputType.SWAP,
        wallet: decodedInputTransferEvent.from,
        swapType: SwapType.FT_TO_FT,
        fromToken: inputTransferEvent.address,
        toToken: outputTransferEvent.address,
        transfersToRemove: [],
        eventsToRemove: [inputTransferEvent, outputTransferEvent],
    }
}

const parseSwapEvent = (events: Connex.VM.Event[], transfers: Connex.VM.Transfer[], userAddress: string) => {
    const vetToTokensSwap = parseSwapVETForTokens(events, transfers, userAddress)
    if (vetToTokensSwap !== null) return vetToTokensSwap
    const tokensToVetSwap = parseSwapTokensForVET(events, transfers, userAddress)
    if (tokensToVetSwap !== null) return tokensToVetSwap
    return parseSwapTokensForTokens(events, transfers, userAddress)
}

const filterUserVetTransfers = (userAddress: string) => {
    return (transfer: Connex.VM.Transfer) =>
        AddressUtils.compareAddresses(userAddress, transfer.sender) ||
        AddressUtils.compareAddresses(userAddress, transfer.recipient)
}

const filterUserEvents = (userAddress: string) => {
    return (
        activity: Exclude<ActivityType, VetTransferOutput | SwapOutput> | null,
    ): activity is Exclude<ActivityType, VetTransferOutput | SwapOutput> => {
        if (!activity) return false
        switch (activity.kind) {
            case TransactionSimulationOutputType.TOKEN_TRANSFER:
            case TransactionSimulationOutputType.NFT_TRANSFER:
                return (
                    AddressUtils.compareAddresses(activity.recipient, userAddress) ||
                    AddressUtils.compareAddresses(activity.sender, userAddress)
                )
            case TransactionSimulationOutputType.TOKEN_ALLOWANCE:
                return AddressUtils.compareAddresses(activity.owner, userAddress)
        }
    }
}

export const retrieveActivityFromTransactionSimulation = (outputs: Connex.VM.Output[], userAddress: string) => {
    return outputs.flatMap(output => {
        const swapEvent = parseSwapEvent(output.events, output.transfers, userAddress)
        let eventsToProcess = [...output.events]
        let transfersToProcess = [...output.transfers]
        if (swapEvent && AddressUtils.compareAddresses(swapEvent.wallet, userAddress)) {
            eventsToProcess = eventsToProcess.filter(u => !swapEvent.eventsToRemove.includes(u))
            transfersToProcess = transfersToProcess.filter(u => !swapEvent.transfersToRemove.includes(u))
        }
        const parsedTransfers: ActivityType[] = transfersToProcess
            .filter(filterUserVetTransfers(userAddress))
            .map(transfer => parseVetTransfer(transfer, userAddress))
        const parsedEvents: ActivityType[] = eventsToProcess
            .map(event => {
                const transferEvent = new abi.Event(abis.VIP180.TransferEvent)
                const approvalEvent = new abi.Event(abis.VIP180.ApprovalEvent)

                switch (event.topics[0].toLowerCase()) {
                    case transferEvent.signature.toLowerCase():
                        return parseTransferEvent(event, userAddress)
                    case approvalEvent.signature.toLowerCase():
                        return parseTokenApprovalEvent(event)
                    default:
                        return null
                }
            })
            .filter(filterUserEvents(userAddress))
        if (swapEvent) return [...parsedTransfers, ...parsedEvents, swapEvent]
        return [...parsedTransfers, ...parsedEvents]
    })
}
