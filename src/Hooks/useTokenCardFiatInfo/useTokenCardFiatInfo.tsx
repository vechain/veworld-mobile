import { TokenWithCompleteInfo } from "~Hooks"
import { useFormatFiat } from "~Hooks/useFormatFiat"
import { useAppSelector, selectIsTokensOwnedLoading } from "~Storage/Redux"
import { ReanimatedUtils } from "~Utils"

export const useTokenCardFiatInfo = (tokenWithInfo: TokenWithCompleteInfo) => {
    const isTokensOwnedLoading = useAppSelector(selectIsTokensOwnedLoading)
    const { chartData, tokenInfo, tokenInfoLoading, fiatBalance, exchangeRate } = tokenWithInfo
    const { formatLocale } = useFormatFiat()

    const getPriceChange = () => {
        // Use chart data if available so the change is sycned with the asset charts,
        // otherwise fallback to the token info change
        if (chartData?.length) {
            const openPrice = chartData[0]?.value
            const closePrice = chartData[chartData.length - 1]?.value

            if (openPrice && closePrice) {
                return ((closePrice - openPrice) / openPrice) * 100
            }
        }

        return tokenInfo?.market_data?.price_change_percentage_24h ?? 0
    }

    const priceChange = getPriceChange()

    const isPositive24hChange = priceChange >= 0

    const change24h =
        (isPositive24hChange ? "+" : "") +
        ReanimatedUtils.numberToPercentWorklet(priceChange, {
            precision: 2,
            absolute: false,
            locale: formatLocale,
        })
    const isLoading = tokenInfoLoading || isTokensOwnedLoading

    return {
        isTokensOwnedLoading,
        fiatBalance,
        exchangeRate,
        isPositive24hChange,
        change24h,
        isLoading,
    }
}
