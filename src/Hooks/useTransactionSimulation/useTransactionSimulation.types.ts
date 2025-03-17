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

export type VetTransferOutput = {
    kind: TransactionSimulationOutputType.VET_TRANSFER
    transferType: TransferType
    sender: string
    recipient: string
    amount: BN
}

export type TokenTransferOutput = Omit<VetTransferOutput, "kind"> & {
    kind: TransactionSimulationOutputType.TOKEN_TRANSFER
    tokenAddress: string
}

export type TokenAllowanceOutput = {
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

type SwapOutputBase = {
    kind: TransactionSimulationOutputType.SWAP
    amountIn: BN
    amountOut: BN
    wallet: string
}

type SwapOutputVetFungible = {
    swapType: SwapType.VET_TO_FT
    toToken: string
}

type SwapOutputFungibleVet = {
    swapType: SwapType.FT_TO_VET
    fromToken: string
}

type SwapOutputFungibleFungible = {
    swapType: SwapType.FT_TO_FT
    fromToken: string
    toToken: string
}

export type SwapOutput = SwapOutputBase & (SwapOutputVetFungible | SwapOutputFungibleVet | SwapOutputFungibleFungible)

export type ActivityType = VetTransferOutput | TokenTransferOutput | TokenAllowanceOutput | SwapOutput
