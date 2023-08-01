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
    const rawTokenBalance = FormattingUtils.scaleNumberDown(
        token.balance.balance,
        token.decimals,
        token.decimals,
    )
    // if vtho subtract the fee estimate from the balance
    const maxTokenAmount = useMemo(() => {
        return new BigNumber(rawTokenBalance)
    }, [rawTokenBalance])

    return { maxTokenAmount }
}
