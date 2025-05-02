import { useMemo } from "react"
import { useVechainStatsTokensInfo } from "~Api/Coingecko"
import { B3TR, VeB3TR } from "~Constants/Constants"
import { useGetVeDelegateBalance } from "~Hooks"
import {
    selectCurrency,
    selectNonVechainTokensBalancesByAccount,
    selectNonVechainTokensWithBalances,
    useAppSelector,
} from "~Storage/Redux"
import { BalanceUtils } from "~Utils"

export const useNonVechainTokenFiat = (accountAddress?: string) => {
    const visibleTokens = useAppSelector(state =>
        accountAddress
            ? selectNonVechainTokensBalancesByAccount(state, accountAddress)
            : selectNonVechainTokensWithBalances(state),
    )
    const currency = useAppSelector(selectCurrency).toLowerCase()

    const { data: nonVeChainTokens } = useVechainStatsTokensInfo()
    const { data: veDelegateBalance } = useGetVeDelegateBalance()

    const nonVechainTokensFiat = useMemo(() => {
        if (!nonVeChainTokens) return []

        return visibleTokens.map(token => {
            let tokenExchangeRate = nonVeChainTokens[token.symbol.toLowerCase()]

            if (token.symbol.toLowerCase() === VeB3TR.symbol) {
                token.balance.balance = veDelegateBalance?.formatted ?? "0"
                tokenExchangeRate = nonVeChainTokens[B3TR.symbol.toLowerCase()]
            }

            if (!tokenExchangeRate) return "0"

            const exchangeRate =
                currency.toLowerCase() === "usd" ? tokenExchangeRate.price_usd : tokenExchangeRate.price_eur

            return BalanceUtils.getFiatBalance(token.balance.balance ?? 0, Number(exchangeRate ?? 0), token.decimals)
        })
    }, [currency, nonVeChainTokens, visibleTokens, veDelegateBalance])

    return nonVechainTokensFiat
}
