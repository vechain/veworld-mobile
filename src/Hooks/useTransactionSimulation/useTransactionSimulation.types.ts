import { BigNumber as BN } from "bignumber.js"

export enum TransactionSimulationOutputType {
    TOKEN_TRANSFER,
    VET_TRANSFER,
    TOKEN_ALLOWANCE,
    SWAP,
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

export enum SwapType {
    VET_TO_FT,
    FT_TO_VET,
    FT_TO_FT,
}

type SwapActivityBase = {
    kind: TransactionSimulationOutputType.SWAP
    amountIn: BN
    amountOut: BN
    wallet: string
}

type SwapActivityVetFungible = {
    swapType: SwapType.VET_TO_FT
    toToken: string
}

type SwapActivityFungibleVet = {
    swapType: SwapType.FT_TO_VET
    fromToken: string
}

type SwapActivityFungibleFungible = {
    swapType: SwapType.FT_TO_FT
    fromToken: string
    toToken: string
}

export type SwapActivity = SwapActivityBase &
    (SwapActivityVetFungible | SwapActivityFungibleVet | SwapActivityFungibleFungible)

export type ActivityType = VetTransferActivity | TokenTransferActivity | TokenAllowanceActivity | SwapActivity
