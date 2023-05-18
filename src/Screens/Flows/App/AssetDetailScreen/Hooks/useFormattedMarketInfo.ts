import { useMemo } from "react"
import { FormattingUtils } from "~Common"
import { CoinMarketInfo } from "~Storage/Redux/Types"
import { selectCurrency, useAppSelector } from "~Storage/Redux"

export const useFormattedMarketInfo = (marketInfo: CoinMarketInfo) => {
    const currency = useAppSelector(selectCurrency)

    const marketCap = useMemo(() => {
        return FormattingUtils.humanNumber(
            marketInfo?.market_cap || 0,
            undefined,
            currency,
        )
    }, [currency, marketInfo?.market_cap])

    const totalSupply = useMemo(() => {
        return FormattingUtils.humanNumber(
            marketInfo?.total_supply || 0,
            undefined,
            currency,
        )
    }, [currency, marketInfo?.total_supply])

    const totalVolume = useMemo(() => {
        return FormattingUtils.humanNumber(
            marketInfo?.total_volume || 0,
            undefined,
            currency,
        )
    }, [currency, marketInfo?.total_volume])

    const circulatingSupply = useMemo(() => {
        return FormattingUtils.humanNumber(
            marketInfo?.circulating_supply || 0,
            undefined,
            currency,
        )
    }, [currency, marketInfo?.circulating_supply])

    return {
        marketCap: marketCap === "< 0.01 USD" ? "N/A" : marketCap,
        totalSupply: totalSupply === "< 0.01 USD" ? "N/A" : totalSupply,
        totalVolume: totalVolume === "< 0.01 USD" ? "N/A" : totalVolume,
        circulatingSupply:
            circulatingSupply === "< 0.01 USD" ? "N/A" : circulatingSupply,
    }
}
