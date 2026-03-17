import { useQuery } from "@tanstack/react-query"
import { useCallback, useMemo } from "react"
import { abis, SWAP_CONFIG, VET_PSEUDO_ADDRESS } from "~Constants"
import { useThor } from "~Components/Providers/ConnexProvider/ConnexProvider"
import { selectSelectedAccount, selectSelectedNetwork, useAppSelector } from "~Storage/Redux"
import { BigNutils } from "~Utils"
import { FungibleTokenWithBalance } from "~Model"
import { DexConfig, SwapQuote } from "./types"
import { useDebounce } from "~Hooks/useDebounce"
import { AnalyticsEvent } from "~Constants"
import { useAnalyticTracking } from "~Hooks/useAnalyticTracking"

type UseSwapQuoteParams = {
    fromToken: FungibleTokenWithBalance | undefined
    toToken: FungibleTokenWithBalance | undefined
    amount: string
    slippageBasisPoints: number
}

type DexQuoteResult = {
    dexConfig: DexConfig
    amountOut: string
    path: string[]
}

export const useSwapQuote = ({ fromToken, toToken, amount, slippageBasisPoints }: UseSwapQuoteParams) => {
    const thor = useThor()
    const track = useAnalyticTracking()
    const selectedAccount = useAppSelector(selectSelectedAccount)
    const network = useAppSelector(selectSelectedNetwork)

    const swapConfig = SWAP_CONFIG[network.type]
    const dexes = swapConfig?.dexes ?? []

    const debouncedAmount = useDebounce(amount, 500)

    const isVET = useCallback((token: FungibleTokenWithBalance) => token.address === VET_PSEUDO_ADDRESS, [])

    const feeAmount = useMemo(() => {
        if (!debouncedAmount || debouncedAmount === "0" || !swapConfig) return "0"
        return BigNutils(debouncedAmount).times(swapConfig.feeBasisPoints).idiv(10000).toString
    }, [debouncedAmount, swapConfig])

    const amountAfterFee = useMemo(() => {
        if (!debouncedAmount || debouncedAmount === "0") return "0"
        return BigNutils(debouncedAmount).minus(feeAmount).toString
    }, [debouncedAmount, feeAmount])

    const enabled = useMemo(
        () =>
            !!fromToken &&
            !!toToken &&
            !!debouncedAmount &&
            debouncedAmount !== "0" &&
            dexes.length > 0 &&
            amountAfterFee !== "0",
        [fromToken, toToken, debouncedAmount, dexes, amountAfterFee],
    )

    const {
        data: quote,
        isLoading,
        error,
    } = useQuery({
        queryKey: [
            "swapQuote",
            fromToken?.address,
            toToken?.address,
            debouncedAmount,
            slippageBasisPoints,
            network.type,
            selectedAccount.address,
        ],
        queryFn: async (): Promise<SwapQuote | null> => {
            if (!fromToken || !toToken || !swapConfig) return null

            track(AnalyticsEvent.SWAP_QUOTE_REQUESTED, {
                fromToken: fromToken.symbol,
                toToken: toToken.symbol,
                amountIn: debouncedAmount,
                dexCount: dexes.length,
            })

            const results: DexQuoteResult[] = []

            for (const dex of dexes) {
                try {
                    const fromAddr = isVET(fromToken) ? dex.wvetAddress : fromToken.address
                    const toAddr = isVET(toToken) ? dex.wvetAddress : toToken.address
                    const path = [fromAddr, toAddr]

                    // Query getAmountsOut directly — reverts if pair doesn't exist
                    const quoteResult = await thor
                        .account(dex.routerAddress)
                        .method(abis.RouterV2.getAmountsOut)
                        .call(amountAfterFee, path)

                    const amounts = quoteResult.decoded["0"] as string[]
                    if (!amounts || amounts.length < 2) continue

                    const amountOut = amounts[amounts.length - 1]
                    if (!amountOut || amountOut === "0") continue

                    results.push({ dexConfig: dex, amountOut, path })
                } catch {
                    // DEX reverted (no pair or no liquidity) — skip
                    continue
                }
            }

            if (results.length === 0) return null

            console.log("Results", results)
            // Pick best quote (highest amountOut)
            const best = results.reduce((prev, curr) =>
                BigNutils(curr.amountOut).isBiggerThan(prev.amountOut) ? curr : prev,
            )

            // Calculate amountOutMin with slippage
            const amountOutMin = BigNutils(best.amountOut)
                .times(10000 - slippageBasisPoints)
                .idiv(10000).toString

            // Approximate price impact
            const priceImpact = calculatePriceImpact(
                debouncedAmount,
                best.amountOut,
                fromToken.decimals,
                toToken.decimals,
            )

            return {
                dexId: best.dexConfig.id,
                dexName: best.dexConfig.name,
                amountIn: debouncedAmount,
                feeAmount,
                amountInAfterFee: amountAfterFee,
                amountOut: best.amountOut,
                amountOutMin,
                priceImpact,
                path: best.path,
                fromToken,
                toToken,
                slippageBasisPoints,
            }
        },
        enabled,
        staleTime: 15_000,
        refetchInterval: 15_000,
    })

    return {
        quote: quote ?? undefined,
        isLoading: enabled && isLoading,
        error,
    }
}

function calculatePriceImpact(amountIn: string, amountOut: string, fromDecimals: number, toDecimals: number): number {
    try {
        const inHuman = BigNutils(amountIn).toHuman(fromDecimals).toNumber
        const outHuman = BigNutils(amountOut).toHuman(toDecimals).toNumber
        if (inHuman === 0 || outHuman === 0) return 0
        // Without a reference market price, we can't compute true price impact.
        // Return 0 for now — the quote display will show the effective rate instead.
        return 0
    } catch {
        return 0
    }
}
