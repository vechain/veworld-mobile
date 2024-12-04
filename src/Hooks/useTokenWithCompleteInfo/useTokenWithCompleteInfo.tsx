import { TokenInfoResponse, getCoinGeckoIdBySymbol, useExchangeRate, useTokenInfo } from "~Api/Coingecko"
import { useBalances } from "~Hooks/useBalances"
import { FungibleToken } from "~Model"
import { selectBalanceForToken, selectCurrency, useAppSelector } from "~Storage/Redux"

export type TokenWithCompleteInfo = FungibleToken & {
    fiatBalance: string
    tokenUnitBalance: string
    tokenUnitFullBalance: string
    exchangeRate?: number
    exchangeRateCurrency: string
    exchangeRateLoading: boolean
    tokenInfo?: TokenInfoResponse
    tokenInfoLoading: boolean
}
/**
 *  useTokenWithCompleteInfo is a hook that returns token with complete info (fiatBalance, tokenUnitBalance, exchangeRate, exchangeRateCurrency, exchangeRateLoading, tokenInfo, tokenInfoLoading)
 * @param token  token with balance (tokenAddress, symbol, balance, decimals)
 * @returns  token with complete info (fiatBalance, tokenUnitBalance, exchangeRate, exchangeRateCurrency, exchangeRateLoading, tokenInfo, tokenInfoLoading)
 */
export const useTokenWithCompleteInfo = (token: FungibleToken): TokenWithCompleteInfo => {
    const balance = useAppSelector(state => selectBalanceForToken(state, token.address))

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

    return {
        ...token,
        fiatBalance,
        tokenUnitBalance,
        tokenUnitFullBalance,
        exchangeRate,
        exchangeRateCurrency: currency,
        exchangeRateLoading,
        tokenInfo,
        tokenInfoLoading,
    }
}
