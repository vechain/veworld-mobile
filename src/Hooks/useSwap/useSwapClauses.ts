import { useCallback, useMemo } from "react"
import { abi, Transaction } from "thor-devkit"
import { abis, SWAP_CONFIG, SWAP_DEADLINE_SECONDS, VET_PSEUDO_ADDRESS } from "~Constants"
import { useThor } from "~Components/Providers/ConnexProvider/ConnexProvider"
import { selectSelectedAccount, selectSelectedNetwork, useAppSelector } from "~Storage/Redux"
import { BigNutils } from "~Utils"
import { SwapQuote } from "./types"
import { useTokenAllowance } from "./useTokenAllowance"

type UseSwapClausesParams = {
    quote: SwapQuote
}

export const useSwapClauses = ({ quote }: UseSwapClausesParams) => {
    const thor = useThor()
    const selectedAccount = useAppSelector(selectSelectedAccount)
    const network = useAppSelector(selectSelectedNetwork)

    const swapConfig = SWAP_CONFIG[network.type]

    const dexConfig = useMemo(
        () => swapConfig?.dexes.find(d => d.id === quote.dexId),
        [swapConfig, quote.dexId],
    )

    const { allowance } = useTokenAllowance({
        tokenAddress: isVET(quote.fromToken.address) ? undefined : quote.fromToken.address,
        spenderAddress: dexConfig?.routerAddress,
    })

    const deadline = useMemo(() => {
        const blockTimestamp = thor.status.head.timestamp
        return String(blockTimestamp + SWAP_DEADLINE_SECONDS)
    }, [thor.status.head.timestamp])

    const clauses = useMemo((): Transaction.Clause[] => {
        if (!dexConfig || !swapConfig) return []

        const fromIsVET = isVET(quote.fromToken.address)
        const toIsVET = isVET(quote.toToken.address)
        const feeCollector = swapConfig.feeCollectorAddress
        const userAddress = selectedAccount.address
        const routerAddress = dexConfig.routerAddress

        const txClauses: Transaction.Clause[] = []

        if (fromIsVET) {
            // VET → Token
            // Clause 1: native VET transfer to feeCollector
            txClauses.push({
                to: feeCollector,
                data: "0x",
                value: `0x${BigNutils(quote.feeAmount).toHex}`,
            })

            // Clause 2: swap VET for tokens
            const swapFn = dexConfig.usesVETMethods
                ? abis.RouterV2.swapExactVETForTokens
                : abis.UniswapRouterV2.swapExactETHForTokens
            const swapData = new abi.Function(swapFn).encode(
                quote.amountOutMin,
                quote.path,
                userAddress,
                deadline,
            )
            txClauses.push({
                to: routerAddress,
                data: swapData,
                value: `0x${BigNutils(quote.amountInAfterFee).toHex}`,
            })
        } else if (toIsVET) {
            // Token → VET
            const needsApproval = BigNutils(allowance).isLessThan(quote.amountInAfterFee)
            if (needsApproval) {
                const approveData = new abi.Function(abis.VIP180.approve).encode(
                    routerAddress,
                    quote.amountInAfterFee,
                )
                txClauses.push({
                    to: quote.fromToken.address,
                    data: approveData,
                    value: "0x0",
                })
            }

            // Fee transfer
            const transferData = new abi.Function(abis.VIP180.transfer).encode(
                feeCollector,
                quote.feeAmount,
            )
            txClauses.push({
                to: quote.fromToken.address,
                data: transferData,
                value: "0x0",
            })

            // Swap
            const swapFn = dexConfig.usesVETMethods
                ? abis.RouterV2.swapExactTokensForVET
                : abis.UniswapRouterV2.swapExactTokensForETH
            const swapData = new abi.Function(swapFn).encode(
                quote.amountInAfterFee,
                quote.amountOutMin,
                quote.path,
                userAddress,
                deadline,
            )
            txClauses.push({
                to: routerAddress,
                data: swapData,
                value: "0x0",
            })
        } else {
            // Token → Token
            const needsApproval = BigNutils(allowance).isLessThan(quote.amountInAfterFee)
            if (needsApproval) {
                const approveData = new abi.Function(abis.VIP180.approve).encode(
                    routerAddress,
                    quote.amountInAfterFee,
                )
                txClauses.push({
                    to: quote.fromToken.address,
                    data: approveData,
                    value: "0x0",
                })
            }

            // Fee transfer
            const transferData = new abi.Function(abis.VIP180.transfer).encode(
                feeCollector,
                quote.feeAmount,
            )
            txClauses.push({
                to: quote.fromToken.address,
                data: transferData,
                value: "0x0",
            })

            // Swap
            const swapData = new abi.Function(abis.RouterV2.swapExactTokensForTokens).encode(
                quote.amountInAfterFee,
                quote.amountOutMin,
                quote.path,
                userAddress,
                deadline,
            )
            txClauses.push({
                to: routerAddress,
                data: swapData,
                value: "0x0",
            })
        }

        return txClauses
    }, [dexConfig, swapConfig, quote, selectedAccount.address, allowance, deadline])

    return { clauses }
}

function isVET(address: string): boolean {
    return address === VET_PSEUDO_ADDRESS
}
