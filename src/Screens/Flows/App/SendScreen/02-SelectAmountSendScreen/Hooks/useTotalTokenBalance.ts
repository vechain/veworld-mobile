import { FungibleTokenWithBalance } from "~Model"
import { FormattingUtils } from "~Utils"
import { BigNumber } from "bignumber.js"
import { useMemo } from "react"

export const useTotalTokenBalance = (token: FungibleTokenWithBalance) => {
    /**
     * TOKEN total balance in raw-ish format (with decimals)
     * Example "2490.000029999996009823"
     */
    const tokenTotalBalance = useMemo(() => {
        return FormattingUtils.scaleNumberDown(
            token.balance.balance,
            token.decimals,
            token.decimals,
            BigNumber.ROUND_DOWN,
        )
    }, [token.balance.balance, token.decimals])

    const tokenTotalToHuman = useMemo(() => {
        return FormattingUtils.formatToHumanNumber(tokenTotalBalance, 2, false)
    }, [tokenTotalBalance])

    return { tokenTotalBalance, tokenTotalToHuman }
}
