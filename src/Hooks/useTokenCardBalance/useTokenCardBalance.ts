import { useMemo } from "react"
import { getCoinGeckoIdBySymbol, useExchangeRate } from "~Api/Coingecko"
import { B3TR } from "~Constants"
import { useBalances } from "~Hooks/useBalances"
import { useCombineFiatBalances } from "~Hooks/useCombineFiatBalances"
import { useFormatFiat } from "~Hooks/useFormatFiat"
import { FungibleTokenWithBalance } from "~Model"
import { selectCurrency, useAppSelector } from "~Storage/Redux"
import { BalanceUtils } from "~Utils"

type Args = {
    token: FungibleTokenWithBalance
}

/**
 * Hook used to display balances correctly on the TokenCard.
 * This hook should be used only for display purposed, not to make any calculation.
 * @param param0 Arguments
 */
export const useTokenCardBalance = ({ token }: Args) => {
    const currency = useAppSelector(selectCurrency)
    const exchangeRateId = useMemo(() => {
        const coingeckoId = getCoinGeckoIdBySymbol[token.symbol]
        if (coingeckoId) return coingeckoId
        //Handle VeDelegate
        if (token.symbol === "veB3TR") return getCoinGeckoIdBySymbol[B3TR.symbol]
        return token.symbol
    }, [token.symbol])

    const { data: exchangeRate } = useExchangeRate({
        vs_currency: currency,
        id: exchangeRateId,
    })

    const { fiatBalance: fiatBalance } = useBalances({
        token,
        exchangeRate: exchangeRate ?? 0,
    })

    const { combineFiatBalances } = useCombineFiatBalances()

    const { amount, areAlmostZero } = useMemo(
        () => combineFiatBalances([fiatBalance]),
        [combineFiatBalances, fiatBalance],
    )

    const { formatFiat, formatLocale } = useFormatFiat()
    const renderFiatBalance = useMemo(() => {
        const formattedFiat = formatFiat({ amount, cover: token.balance.isHidden })
        if (token.balance.isHidden) return formattedFiat
        if (areAlmostZero) return `< ${formattedFiat}`
        return formattedFiat
    }, [formatFiat, amount, token.balance.isHidden, areAlmostZero])

    const tokenBalance = useMemo(
        () => BalanceUtils.getTokenUnitBalance(token.balance.balance, token.decimals ?? 0, 2, formatLocale),
        [formatLocale, token.balance.balance, token.decimals],
    )

    const showFiatBalance = useMemo(() => {
        return !!exchangeRate
    }, [exchangeRate])

    return useMemo(
        () => ({
            showFiatBalance,
            fiatBalance: renderFiatBalance,
            tokenBalance,
        }),
        [renderFiatBalance, showFiatBalance, tokenBalance],
    )
}
