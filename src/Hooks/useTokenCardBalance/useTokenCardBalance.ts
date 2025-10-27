import { useCallback, useMemo } from "react"
import { getCoinGeckoIdBySymbol, useExchangeRate } from "~Api/Coingecko"
import { B3TR, VeDelegate } from "~Constants"
import { useBalances } from "~Hooks/useBalances"
import { useCombineFiatBalances } from "~Hooks/useCombineFiatBalances"
import { FormatFiatFuncArgs, useFormatFiat } from "~Hooks/useFormatFiat"
import { FungibleTokenWithBalance } from "~Model"
import { selectBalanceVisible, selectCurrency, useAppSelector } from "~Storage/Redux"
import { formatTokenAmount } from "~Utils/StandardizedFormatting"

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
    const isBalanceVisible = useAppSelector(selectBalanceVisible)

    const exchangeRateId = useMemo(() => {
        const coingeckoId = getCoinGeckoIdBySymbol[token.symbol]
        if (coingeckoId) return coingeckoId
        //Handle VeDelegate
        if (token.symbol === VeDelegate.symbol) return getCoinGeckoIdBySymbol[B3TR.symbol]
        return token.symbol
    }, [token.symbol])

    const { data: exchangeRate } = useExchangeRate({
        vs_currency: currency,
        id: exchangeRateId,
    })

    const { fiatBalance } = useBalances({
        token,
        exchangeRate: exchangeRate ?? 0,
    })

    const { combineFiatBalances } = useCombineFiatBalances()

    const { amount, areAlmostZero } = useMemo(
        () => combineFiatBalances([fiatBalance]),
        [combineFiatBalances, fiatBalance],
    )

    const { formatFiat, formatLocale } = useFormatFiat()

    const renderFiatBalance = useCallback(
        (args: Omit<FormatFiatFuncArgs, "amount" | "cover"> = {}) => {
            const formattedFiat = formatFiat({ amount, cover: !isBalanceVisible, ...args })
            if (!isBalanceVisible) return formattedFiat
            if (areAlmostZero) return `< ${formattedFiat}`
            return formattedFiat
        },
        [amount, areAlmostZero, formatFiat, isBalanceVisible],
    )

    const memoizedFiatBalance = useMemo(() => renderFiatBalance(), [renderFiatBalance])

    const tokenBalance = useMemo(() => {
        return formatTokenAmount(token.balance.balance, token.symbol, token.decimals ?? 0, {
            locale: formatLocale,
            includeSymbol: false,
        })
    }, [formatLocale, token.balance.balance, token.decimals, token.symbol])

    const showFiatBalance = useMemo(() => {
        return !!exchangeRate
    }, [exchangeRate])

    return useMemo(
        () => ({
            showFiatBalance,
            fiatBalance: memoizedFiatBalance,
            tokenBalance,
            renderFiatBalance,
        }),
        [memoizedFiatBalance, renderFiatBalance, showFiatBalance, tokenBalance],
    )
}
