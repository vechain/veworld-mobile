import { TokenWithCompleteInfo } from "~Hooks"
import { useAppSelector, selectIsTokensOwnedLoading } from "~Storage/Redux"
import { ReanimatedUtils } from "~Utils"

export const useTokenCardFiatInfo = (tokenWithInfo: TokenWithCompleteInfo) => {
    const isTokensOwnedLoading = useAppSelector(selectIsTokensOwnedLoading)

    const { chartData, tokenInfo, tokenInfoLoading, fiatBalance, exchangeRate } = tokenWithInfo
    let priceChange = 0
    if (chartData?.length) {
        const openPrice = chartData[0]?.value
        const closePrice = chartData[chartData.length - 1]?.value

        if (openPrice && closePrice) {
            priceChange = ((closePrice - openPrice) / openPrice) * 100
        }
    } else {
        priceChange = tokenInfo?.market_data?.price_change_percentage_24h ?? 0
    }

    const isPositive24hChange = priceChange >= 0

    const change24h = ReanimatedUtils.numberToPercentWorklet(priceChange, {
        precision: 2,
        absolute: true,
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
