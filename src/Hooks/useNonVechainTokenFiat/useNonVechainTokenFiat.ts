import { useMemo } from "react"
import { useVechainStatsTokensInfo } from "~Api/Coingecko"
import { selectCurrency, selectNonVechainTokensWithBalances, useAppSelector } from "~Storage/Redux"
import { BalanceUtils } from "~Utils"

export const useNonVechainTokenFiat = () => {
    const visibleTokens = useAppSelector(selectNonVechainTokensWithBalances)
    const currency = useAppSelector(selectCurrency).toLowerCase()

    const { data: nonVeChainTokens } = useVechainStatsTokensInfo()

    const nonVechainTokensFiat = useMemo(() => {
        if (!nonVeChainTokens) return []

        return (
            visibleTokens
                // TODO: remove this filter when introducing the fiat for VOT3
                .filter(token => token.symbol.toLowerCase() !== "vot3")
                .map(token => {
                    const tokenExchangeRate = nonVeChainTokens[token.symbol.toLowerCase()]
                    if (!tokenExchangeRate) return "0"

                    const exchangeRate = currency === "USD" ? tokenExchangeRate.price_usd : tokenExchangeRate.price_eur

                    return BalanceUtils.getFiatBalance(
                        token.balance.balance ?? 0,
                        Number(exchangeRate ?? 0),
                        token.decimals,
                    )
                })
        )
    }, [currency, nonVeChainTokens, visibleTokens])

    return nonVechainTokensFiat
}
