import { useMemo } from "react"
import { BalanceUtils } from "~Common/Utils"
import { TokenWithCompleteInfo } from "~Model"
import { selectCurrencyExchangeRate, useAppSelector } from "~Storage/Redux"

export const useBalances = ({ token }: { token: TokenWithCompleteInfo }) => {
    const exchangeRate = useAppSelector(state =>
        selectCurrencyExchangeRate(state, token.symbol as string),
    )

    const fiatBalance = useMemo(
        () =>
            BalanceUtils.getFiatBalance(
                token?.balance?.balance ?? "0",
                exchangeRate?.rate || 0,
                token.decimals,
            ),
        [exchangeRate?.rate, token?.balance?.balance, token.decimals],
    )

    const tokenUnitBalance = useMemo(
        () =>
            BalanceUtils.getTokenUnitBalance(
                token?.balance?.balance ?? "0",
                token.decimals,
            ),
        [token?.balance?.balance, token.decimals],
    )

    return { fiatBalance, tokenUnitBalance }
}
