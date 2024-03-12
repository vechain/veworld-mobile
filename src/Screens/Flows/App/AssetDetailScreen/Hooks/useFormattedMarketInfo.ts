import { useMemo } from "react"
import { BigNutils } from "~Utils"

export type MarketInfo = {
    marketCap: number
    totalSupply: number | null
    totalVolume: number
    circulatingSupply: number
}

export const useFormattedMarketInfo = ({ marketInfo }: { marketInfo?: MarketInfo }) => {
    const marketCap = useMemo(() => {
        return BigNutils(marketInfo?.marketCap ?? 0).toCurrencyFormat_string(0)
    }, [marketInfo?.marketCap])

    const totalSupply = useMemo(() => {
        return BigNutils(marketInfo?.totalSupply ?? 0).toTokenFormat_string(0)
    }, [marketInfo?.totalSupply])

    const totalVolume = useMemo(() => {
        return BigNutils(marketInfo?.totalVolume ?? 0).toCurrencyFormat_string(0)
    }, [marketInfo?.totalVolume])

    const circulatingSupply = useMemo(() => {
        return BigNutils(marketInfo?.circulatingSupply ?? 0).toCurrencyFormat_string(0)
    }, [marketInfo?.circulatingSupply])

    return {
        marketCap: marketCap === "< 0.01" ? null : marketCap,
        totalSupply: totalSupply === "0" ? null : totalSupply,
        totalVolume: totalVolume === "< 0.01" ? null : totalVolume,
        circulatingSupply: circulatingSupply === "0" ? null : circulatingSupply,
    }
}
