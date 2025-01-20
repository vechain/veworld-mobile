import { TokenWithCompleteInfo } from "~Hooks"
import { useAppSelector, selectIsTokensOwnedLoading } from "~Storage/Redux"
import { BigNutils } from "~Utils"

export const useTokenCardFiatInfo = (tokenWithInfo: TokenWithCompleteInfo) => {
    const isTokensOwnedLoading = useAppSelector(selectIsTokensOwnedLoading)

    const { tokenInfo, tokenInfoLoading, fiatBalance, exchangeRate } = tokenWithInfo

    const isPositive24hChange = (tokenInfo?.market_data?.price_change_percentage_24h ?? 0) >= 0

    const change24h =
        (isPositive24hChange ? "+" : "") +
        BigNutils(tokenInfo?.market_data?.price_change_percentage_24h ?? 0)
            .toHuman(0)
            .decimals(2).toString +
        "%"

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
