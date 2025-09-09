import { useMemo } from "react"
import { useVechainStatsTokensInfo } from "~Api/Coingecko"
import { B3TR, VeDelegate } from "~Constants/Constants"
import { useNonVechainTokensBalance } from "~Hooks/useNonVechainTokensBalance"
import { selectCurrency, useAppSelector } from "~Storage/Redux"
import { BalanceUtils } from "~Utils"

export const useNonVechainTokenFiat = (accountAddress?: string) => {
    const { data: visibleTokens } = useNonVechainTokensBalance(accountAddress)
    const currency = useAppSelector(selectCurrency).toLowerCase()

    const { data: nonVeChainTokens } = useVechainStatsTokensInfo()

    const nonVechainTokensFiat = useMemo(() => {
        if (!nonVeChainTokens) return []

        return visibleTokens.map(token => {
            let tokenExchangeRate = nonVeChainTokens[token.symbol.toLowerCase()]

            // VeDelegate is not a real token, it's exchange rate is the same as B3TR
            if (token.symbol === VeDelegate.symbol) {
                tokenExchangeRate = nonVeChainTokens[B3TR.symbol.toLowerCase()]
            }

            if (!tokenExchangeRate) return "0"

            const exchangeRate =
                currency.toLowerCase() === "usd" ? tokenExchangeRate.price_usd : tokenExchangeRate.price_eur

            return BalanceUtils.getFiatBalance(token.balance.balance ?? 0, Number(exchangeRate ?? 0), token.decimals)
        })
    }, [currency, nonVeChainTokens, visibleTokens])

    return nonVechainTokensFiat
}
