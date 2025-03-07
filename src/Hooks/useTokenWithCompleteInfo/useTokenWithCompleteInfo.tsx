import {
    MarketChartResponse,
    TokenInfoResponse,
    getCoinGeckoIdBySymbol,
    useExchangeRate,
    useMarketChart,
    useTokenInfo,
} from "~Api/Coingecko"
import { useBalances } from "~Hooks/useBalances"
import { Balance, FungibleToken } from "~Model"
import { selectBalanceForToken, selectBalanceForTokenByAccount, selectCurrency, useAppSelector } from "~Storage/Redux"

export type TokenWithCompleteInfo = FungibleToken & {
    fiatBalance: string
    tokenUnitBalance: string
    tokenUnitFullBalance: string
    exchangeRate?: number
    exchangeRateCurrency: string
    exchangeRateLoading: boolean
    tokenInfo?: TokenInfoResponse
    tokenInfoLoading: boolean
    chartData?: MarketChartResponse
    balance?: Balance
}
/**
 *  useTokenWithCompleteInfo is a hook that returns token with complete info (fiatBalance, tokenUnitBalance, exchangeRate, exchangeRateCurrency, exchangeRateLoading, tokenInfo, tokenInfoLoading)
 * @param token  token with balance (tokenAddress, symbol, balance, decimals)
 * @returns  token with complete info (fiatBalance, tokenUnitBalance, exchangeRate, exchangeRateCurrency, exchangeRateLoading, tokenInfo, tokenInfoLoading)
 */
export const useTokenWithCompleteInfo = (token: FungibleToken, accountAddress?: string): TokenWithCompleteInfo => {
    const balance = useAppSelector(state =>
        accountAddress
            ? selectBalanceForTokenByAccount(state, token.address, accountAddress)
            : selectBalanceForToken(state, token.address),
    )

    const currency = useAppSelector(selectCurrency)
    const { data: exchangeRate, isLoading: exchangeRateLoading } = useExchangeRate({
        id: getCoinGeckoIdBySymbol[token.symbol],
        vs_currency: currency,
    })

    const { fiatBalance, tokenUnitBalance, tokenUnitFullBalance } = useBalances({
        token: { ...token, balance },
        exchangeRate,
    })
    const { data: tokenInfo, isLoading: tokenInfoLoading } = useTokenInfo({
        id: getCoinGeckoIdBySymbol[token.symbol],
    })

    const { data: chartData } = useMarketChart({
        id: getCoinGeckoIdBySymbol[token.symbol],
        vs_currency: currency,
        days: 1,
    })

    return {
        ...token,
        fiatBalance,
        tokenUnitBalance,
        tokenUnitFullBalance,
        balance,
        exchangeRate,
        exchangeRateCurrency: currency,
        exchangeRateLoading,
        tokenInfo,
        tokenInfoLoading,
        chartData,
    }
}
