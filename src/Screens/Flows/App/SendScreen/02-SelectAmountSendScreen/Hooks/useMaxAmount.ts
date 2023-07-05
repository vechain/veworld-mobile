import { VTHO } from "~Constants"
import { useVthoFeeEstimate } from "./useVthoFeeEstimate"
import BigNumber from "bignumber.js"
import { useMemo } from "react"
import { FormattingUtils } from "~Utils"
import { FungibleTokenWithBalance } from "~Model"

/**
 * calculate max amount for the input
 * @param token token to calculate max amount for
 */
export const useMaxAmount = ({
    token,
}: {
    token: FungibleTokenWithBalance
}): {
    maxTokenAmount: BigNumber
} => {
    const { vthoFeeEstimate } = useVthoFeeEstimate({
        skip: token.symbol !== VTHO.symbol,
    })

    const rawTokenBalance = FormattingUtils.scaleNumberDown(
        token.balance.balance,
        token.decimals,
        token.decimals,
    )
    // if vtho subtract the fee estimate from the balance
    const maxTokenAmount = useMemo(() => {
        if (token.symbol === VTHO.symbol) {
            return new BigNumber(rawTokenBalance).gt(vthoFeeEstimate)
                ? new BigNumber(rawTokenBalance).minus(vthoFeeEstimate)
                : new BigNumber(0)
        } else {
            return new BigNumber(rawTokenBalance)
        }
    }, [rawTokenBalance, token.symbol, vthoFeeEstimate])

    return { maxTokenAmount }
}
