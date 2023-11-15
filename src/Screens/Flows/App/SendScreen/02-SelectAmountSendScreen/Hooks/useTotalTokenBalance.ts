import { FungibleTokenWithBalance } from "~Model"
import { FormattingUtils } from "~Utils"
import { BigNumber } from "bignumber.js"
import { useMemo } from "react"

export const useTotalTokenBalance = (
    token: FungibleTokenWithBalance,
    languageTag: string,
) => {
    /**
     * TOKEN total balance in raw-ish format (with decimals)
     * Example "2490.000029999996009823"
     */
    const tokenTotalBalance = useMemo(
        () =>
            FormattingUtils.scaleNumberDown(
                token.balance.balance,
                token.decimals,
                token.decimals,
                BigNumber.ROUND_DOWN,
            ),
        [token.balance.balance, token.decimals],
    )

    /**
     * TOKEN total balance in human readable format
     * Example "2,490.00"
     */
    const tokenHumanTotalBalance = useMemo(
        () =>
            FormattingUtils.formatToHumanNumber(
                new BigNumber(tokenTotalBalance)
                    .decimalPlaces(2, BigNumber.ROUND_DOWN)
                    .toString(),
                2,
                languageTag,
            ),
        [tokenTotalBalance, languageTag],
    )

    return { tokenTotalBalance, tokenHumanTotalBalance }
}
