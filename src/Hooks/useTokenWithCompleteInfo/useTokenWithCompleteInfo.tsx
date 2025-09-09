import { useMemo } from "react"
import {
    MarketChartResponse,
    TokenInfoResponse,
    getCoinGeckoIdBySymbol,
    useExchangeRate,
    useMarketChart,
    useTokenInfo,
} from "~Api/Coingecko"
import { B3TR, VOT3 } from "~Constants"
import { useBalances } from "~Hooks/useBalances"
import { useTokenBalance } from "~Hooks/useTokenBalance"
import { Balance, FungibleToken } from "~Model"
import { selectCurrency, useAppSelector } from "~Storage/Redux"

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
    const { data: balance, isFetching } = useTokenBalance({ tokenAddress: token.address, address: accountAddress })

    const parsedSymbol = useMemo(() => {
        if (token.symbol === VOT3.symbol) return B3TR.symbol
        return token.symbol
    }, [token.symbol])

    const currency = useAppSelector(selectCurrency)
    const { data: exchangeRate, isLoading: exchangeRateLoading } = useExchangeRate({
        id: getCoinGeckoIdBySymbol[parsedSymbol],
        vs_currency: currency,
    })

    const { fiatBalance, tokenUnitBalance, tokenUnitFullBalance } = useBalances({
        token: { ...token, balance },
        exchangeRate,
    })
    const { data: tokenInfo, isLoading: _tokenInfoLoading } = useTokenInfo({
        id: getCoinGeckoIdBySymbol[parsedSymbol],
    })

    const { data: chartData } = useMarketChart({
        id: getCoinGeckoIdBySymbol[parsedSymbol],
        vs_currency: currency,
        days: 1,
    })

    const tokenInfoLoading = useMemo(() => _tokenInfoLoading || isFetching, [_tokenInfoLoading, isFetching])

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
