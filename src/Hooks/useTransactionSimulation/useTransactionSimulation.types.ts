import { BigNumber as BN } from "bignumber.js"

export enum TransactionSimulationOutputType {
    TOKEN_TRANSFER,
    VET_TRANSFER,
    TOKEN_ALLOWANCE,
}

export enum TransferType {
    RECEIVE,
    SEND,
}

export type VetTransferActivity = {
    kind: TransactionSimulationOutputType.VET_TRANSFER
    transferType: TransferType
    sender: string
    recipient: string
    amount: BN
}

export type TokenTransferActivity = Omit<VetTransferActivity, "kind"> & {
    kind: TransactionSimulationOutputType.TOKEN_TRANSFER
    tokenAddress: string
}

export type TokenAllowanceActivity = {
    kind: TransactionSimulationOutputType.TOKEN_ALLOWANCE
    tokenAddress: string
    owner: string
    spender: string
    amount: BN
}

export type ActivityType = VetTransferActivity | TokenTransferActivity | TokenAllowanceActivity
