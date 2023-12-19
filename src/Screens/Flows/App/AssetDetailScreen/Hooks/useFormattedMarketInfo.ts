import { useMemo } from "react"
import { FormattingUtils } from "~Utils"

export type MarketInfo = {
    marketCap: number
    totalSupply: number
    totalVolume: number
    circulatingSupply: number
}

export const useFormattedMarketInfo = ({ marketInfo }: { marketInfo?: MarketInfo }) => {
    const marketCap = useMemo(() => {
        return FormattingUtils.humanNumber(marketInfo?.marketCap ?? 0)
    }, [marketInfo?.marketCap])

    const totalSupply = useMemo(() => {
        return FormattingUtils.humanNumber(marketInfo?.totalSupply ?? 0)
    }, [marketInfo?.totalSupply])

    const totalVolume = useMemo(() => {
        return FormattingUtils.humanNumber(marketInfo?.totalVolume ?? 0)
    }, [marketInfo?.totalVolume])

    const circulatingSupply = useMemo(() => {
        return FormattingUtils.humanNumber(marketInfo?.circulatingSupply ?? 0)
    }, [marketInfo?.circulatingSupply])

    return {
        marketCap: marketCap === "< 0.01" ? null : marketCap,
        totalSupply: totalSupply === "< 0.01" ? null : totalSupply,
        totalVolume: totalVolume === "< 0.01" ? null : totalVolume,
        circulatingSupply: circulatingSupply === "< 0.01" ? null : circulatingSupply,
    }
}
