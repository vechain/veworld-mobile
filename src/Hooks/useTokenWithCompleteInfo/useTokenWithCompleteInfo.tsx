import { getCoinGeckoIdBySymbol, useExchangeRate, useTokenInfo } from "~Api"
import { useBalances } from "~Hooks/useBalances"
import { FungibleToken } from "~Model"
import {
    selectBalanceForToken,
    selectCurrency,
    useAppSelector,
} from "~Storage/Redux"

/**
 *  useTokenWithCompleteInfo is a hook that returns token with complete info (fiatBalance, tokenUnitBalance, exchangeRate, exchangeRateCurrency, exchangeRateLoading, tokenInfo, tokenInfoLoading)
 * @param token  token with balance (tokenAddress, symbol, balance, decimals)
 * @returns  token with complete info (fiatBalance, tokenUnitBalance, exchangeRate, exchangeRateCurrency, exchangeRateLoading, tokenInfo, tokenInfoLoading)
 */
export const useTokenWithCompleteInfo = (token: FungibleToken) => {
    const balance = useAppSelector(state =>
        selectBalanceForToken(state, token.address),
    )

    const currency = useAppSelector(selectCurrency)
    const { data: exchangeRate, isLoading: exchangeRateLoading } =
        useExchangeRate({
            id: getCoinGeckoIdBySymbol[token.symbol],
            vs_currency: currency,
        })
    const { fiatBalance, tokenUnitBalance } = useBalances({
        token: { ...token, balance },
        exchangeRate,
    })
    const { data: tokenInfo, isLoading: tokenInfoLoading } = useTokenInfo({
        id: getCoinGeckoIdBySymbol[token.symbol],
    })

    return {
        ...token,
        fiatBalance,
        tokenUnitBalance,
        exchangeRate,
        exchangeRateCurrency: currency,
        exchangeRateLoading,
        tokenInfo,
        tokenInfoLoading,
    }
}
