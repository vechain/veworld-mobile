import { abi } from "thor-devkit"
import { abis } from "~Constants"
import { AddressUtils, BigNutils, TransactionUtils } from "~Utils"
import {
    ActivityType,
    SwapActivity,
    SwapType,
    TokenAllowanceActivity,
    TokenTransferActivity,
    TransactionSimulationOutputType,
    TransferType,
    VetTransferActivity,
} from "./useTransactionSimulation.types"
import { ClauseType } from "~Model"

const parseTokenTransferEvent = (evt: Connex.VM.Event, userAddress: string): TokenTransferActivity => {
    const transferAbi = new abi.Event(abis.VIP180.TransferEvent)
    const decoded = transferAbi.decode(evt.data, evt.topics)
    return {
        kind: TransactionSimulationOutputType.TOKEN_TRANSFER,
        amount: BigNutils(decoded.value).bn,
        recipient: decoded.to,
        sender: decoded.from,
        tokenAddress: evt.address,
        transferType: AddressUtils.compareAddresses(decoded.to, userAddress) ? TransferType.RECEIVE : TransferType.SEND,
    }
}

const parseTokenApprovalEvent = (evt: Connex.VM.Event): TokenAllowanceActivity => {
    const transferAbi = new abi.Event(abis.VIP180.ApprovalEvent)
    const decoded = transferAbi.decode(evt.data, evt.topics)
    return {
        kind: TransactionSimulationOutputType.TOKEN_ALLOWANCE,
        amount: BigNutils(decoded.value).bn,
        owner: decoded.owner,
        spender: decoded.spender,
        tokenAddress: evt.address,
    }
}

const parseVetTransfer = (transfer: Connex.VM.Transfer, userAddress: string): VetTransferActivity => {
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

const parseSwapEvent = (
    events: Connex.VM.Event[],
    transfers: Connex.VM.Transfer[],
    clause: Connex.VM.Clause,
    userAddress: string,
): (SwapActivity & { transfersToRemove: Connex.VM.Transfer[]; eventsToRemove: Connex.VM.Event[] }) | null => {
    const swapEventAbi = new abi.Event(abis.UniswapPairV2.SwapEvent)
    //TODO: This can be simplified by just trying all the combinations in order
    const decodedClause = TransactionUtils.decodeContractCall(clause)
    if (!decodedClause) return null

    const transferEventAbi = new abi.Event(abis.VIP180.TransferEvent)

    switch (decodedClause.type) {
        case ClauseType.SWAP_VET_FOR_TOKENS: {
            const inputTransfer = transfers.find(tsf => AddressUtils.compareAddresses(tsf.sender, userAddress))
            if (!inputTransfer) return null
            const outputTransferEvent = events.find(event => {
                return (
                    event.topics[0].toLowerCase() === transferEventAbi.signature.toLowerCase() &&
                    AddressUtils.compareAddresses(transferEventAbi.decode(event.data, event.topics).to, userAddress)
                )
            })
            if (!outputTransferEvent) return null
            const decodedOutputTransferEvent = transferEventAbi.decode(
                outputTransferEvent.data,
                outputTransferEvent.topics,
            )
            const swapEvent = events.find(event => {
                return (
                    event.topics[0].toLowerCase() === swapEventAbi.signature.toLowerCase() &&
                    AddressUtils.compareAddresses(swapEventAbi.decode(event.data, event.topics).to, userAddress)
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
        case ClauseType.SWAP_TOKENS_FOR_VET: {
            const outputTransfer = transfers.find(tsf => AddressUtils.compareAddresses(tsf.recipient, userAddress))
            if (!outputTransfer) return null
            const inputTransferEvent = events.find(event => {
                return (
                    event.topics[0].toLowerCase() === transferEventAbi.signature.toLowerCase() &&
                    AddressUtils.compareAddresses(transferEventAbi.decode(event.data, event.topics).from, userAddress)
                )
            })
            if (!inputTransferEvent) return null
            const decodedInputTransferEvent = transferEventAbi.decode(
                inputTransferEvent.data,
                inputTransferEvent.topics,
            )
            const swapEvent = events.find(event => {
                return event.topics[0].toLowerCase() === swapEventAbi.signature.toLowerCase()
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
        case ClauseType.SWAP_TOKENS_FOR_TOKENS: {
            const inputTransferEvent = events.find(event => {
                return (
                    event.topics[0].toLowerCase() === transferEventAbi.signature.toLowerCase() &&
                    AddressUtils.compareAddresses(transferEventAbi.decode(event.data, event.topics).from, userAddress)
                )
            })
            if (!inputTransferEvent) return null
            const decodedInputTransferEvent = transferEventAbi.decode(
                inputTransferEvent.data,
                inputTransferEvent.topics,
            )
            const outputTransferEvent = events.find(event => {
                return (
                    event.topics[0].toLowerCase() === transferEventAbi.signature.toLowerCase() &&
                    AddressUtils.compareAddresses(transferEventAbi.decode(event.data, event.topics).to, userAddress)
                )
            })
            if (!outputTransferEvent) return null
            const decodedOutputTransferEvent = transferEventAbi.decode(
                outputTransferEvent.data,
                outputTransferEvent.topics,
            )
            const swapEvent = events.find(event => {
                return (
                    event.topics[0].toLowerCase() === swapEventAbi.signature.toLowerCase() &&
                    AddressUtils.compareAddresses(swapEventAbi.decode(event.data, event.topics).to, userAddress)
                )
            })
            if (!swapEvent) return null
            if (!AddressUtils.compareAddresses(decodedInputTransferEvent.from, decodedOutputTransferEvent.to))
                return null
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
        default:
            return null
    }
}

const filterUserVetTransfers = (userAddress: string) => {
    return (transfer: Connex.VM.Transfer) =>
        AddressUtils.compareAddresses(userAddress, transfer.sender) ||
        AddressUtils.compareAddresses(userAddress, transfer.recipient)
}

const filterUserEvents = (userAddress: string) => {
    return (
        activity: Exclude<ActivityType, VetTransferActivity | SwapActivity> | null,
    ): activity is Exclude<ActivityType, VetTransferActivity | SwapActivity> => {
        if (!activity) return false
        switch (activity.kind) {
            case TransactionSimulationOutputType.TOKEN_TRANSFER:
                return (
                    AddressUtils.compareAddresses(activity.recipient, userAddress) ||
                    AddressUtils.compareAddresses(activity.sender, userAddress)
                )
            case TransactionSimulationOutputType.TOKEN_ALLOWANCE:
                return AddressUtils.compareAddresses(activity.owner, userAddress)
        }
    }
}

export const retrieveActivityFromTransactionSimulation = (
    outputs: Connex.VM.Output[],
    fungibleTokenAddresses: string[],
    userAddress: string,
    clauses: Connex.VM.Clause[],
) => {
    return outputs.flatMap((output, outputIdx) => {
        const swapEvent = parseSwapEvent(output.events, output.transfers, clauses[outputIdx], userAddress)
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
            .filter(evt =>
                fungibleTokenAddresses.find(fungibleAddress =>
                    AddressUtils.compareAddresses(fungibleAddress, evt.address),
                ),
            )
            .map(event => {
                const transferEvent = new abi.Event(abis.VIP180.TransferEvent)
                const approvalEvent = new abi.Event(abis.VIP180.ApprovalEvent)

                switch (event.topics[0].toLowerCase()) {
                    case transferEvent.signature.toLowerCase():
                        return parseTokenTransferEvent(event, userAddress)
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
