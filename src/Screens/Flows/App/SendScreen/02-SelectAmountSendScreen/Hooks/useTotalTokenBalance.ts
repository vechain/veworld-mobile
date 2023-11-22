import { FungibleTokenWithBalance } from "~Model"
import { FormattingUtils } from "~Utils"
import { BigNumber } from "bignumber.js"
import { useMemo } from "react"

export const useTotalTokenBalance = (token: FungibleTokenWithBalance, vthoEstimate: BigNumber) => {
    /**
     * TOKEN total balance in raw-ish format (with decimals)
     * Example "2490.000029999996009823"
     */
    const tokenTotalBalance = useMemo(() => {
        let total = ""

        if (token?.symbol?.toLowerCase() === "vtho") {
            let newTotal: BigNumber | string = new BigNumber(token.balance.balance).minus(vthoEstimate)

            newTotal = newTotal.isLessThan(0) ? "0" : newTotal

            total = FormattingUtils.scaleNumberDown(newTotal, token.decimals, token.decimals, BigNumber.ROUND_DOWN)
        } else {
            total = FormattingUtils.scaleNumberDown(
                token.balance.balance,
                token.decimals,
                token.decimals,
                BigNumber.ROUND_DOWN,
            )
        }

        return total
    }, [token.balance.balance, token.decimals, token.symbol, vthoEstimate])

    return { tokenTotalBalance }
}
