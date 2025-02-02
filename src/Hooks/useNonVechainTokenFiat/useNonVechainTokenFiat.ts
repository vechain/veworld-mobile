import { useMemo } from "react"
import { useVechainStatsTokensInfo } from "~Api/Coingecko"
import { VeB3TR } from "~Constants"
import { useVeB3TRFiat } from "~Hooks/useVeB3TRFiat"
import {
    selectCurrency,
    selectNonVechainTokensBalancesByAccount,
    selectNonVechainTokensWithBalances,
    useAppSelector,
} from "~Storage/Redux"
import { AddressUtils, BalanceUtils } from "~Utils"

export const useNonVechainTokenFiat = (accountAddress?: string) => {
    const visibleTokens = useAppSelector(state =>
        accountAddress
            ? selectNonVechainTokensBalancesByAccount(state, accountAddress)
            : selectNonVechainTokensWithBalances(state),
    )

    const veB3trBalance = useVeB3TRFiat()

    const currency = useAppSelector(selectCurrency).toLowerCase()

    const { data: nonVeChainTokens } = useVechainStatsTokensInfo()

    const nonVechainTokensFiat = useMemo(() => {
        if (!nonVeChainTokens) return []

        return visibleTokens.map(token => {
            if (AddressUtils.compareAddresses(token.address, VeB3TR.address)) {
                return veB3trBalance
            } else {
                const tokenExchangeRate = nonVeChainTokens[token.symbol.toLowerCase()]
                if (!tokenExchangeRate) return "0"

                const exchangeRate = currency === "USD" ? tokenExchangeRate.price_usd : tokenExchangeRate.price_eur

                return BalanceUtils.getFiatBalance(
                    token.balance.balance ?? 0,
                    Number(exchangeRate ?? 0),
                    token.decimals,
                )
            }
        })
    }, [currency, nonVeChainTokens, veB3trBalance, visibleTokens])

    return nonVechainTokensFiat
}
