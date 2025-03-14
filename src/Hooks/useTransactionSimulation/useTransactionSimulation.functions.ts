import { abi } from "thor-devkit"
import { abis } from "~Constants"
import { AddressUtils, BigNutils } from "~Utils"
import {
    ActivityType,
    TokenAllowanceActivity,
    TokenTransferActivity,
    TransactionSimulationOutputType,
    TransferType,
    VetTransferActivity,
} from "./useTransactionSimulation.types"

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

const filterUserVetTransfers = (userAddress: string) => {
    return (transfer: Connex.VM.Transfer) =>
        AddressUtils.compareAddresses(userAddress, transfer.sender) ||
        AddressUtils.compareAddresses(userAddress, transfer.recipient)
}

const filterUserEvents = (userAddress: string) => {
    return (
        activity: Exclude<ActivityType, VetTransferActivity> | null,
    ): activity is Exclude<ActivityType, VetTransferActivity> => {
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
) => {
    return outputs.flatMap(output => {
        const parsedTransfers: ActivityType[] = output.transfers
            .filter(filterUserVetTransfers(userAddress))
            .map(transfer => parseVetTransfer(transfer, userAddress))
        const parsedEvents: ActivityType[] = output.events
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

        return [...parsedTransfers, ...parsedEvents]
    })
}
