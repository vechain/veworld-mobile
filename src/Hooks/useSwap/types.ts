import { FungibleTokenWithBalance } from "~Model"

export type { DexConfig } from "~Constants/Constants/Swap/SwapConstants"

export type SwapQuote = {
    dexId: string
    dexName: string
    amountIn: string
    feeAmount: string
    amountInAfterFee: string
    amountOut: string
    amountOutMin: string
    priceImpact: number
    path: string[]
    fromToken: FungibleTokenWithBalance
    toToken: FungibleTokenWithBalance
    slippageBasisPoints: number
}
