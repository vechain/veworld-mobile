import { useMemo } from "react"
import { useFormatFiat } from "~Hooks/useFormatFiat"
import { formatMarketData, formatFiatAmount } from "~Utils/StandardizedFormatting"

export type MarketInfo = {
    marketCap: number
    totalSupply: number | null
    totalVolume: number
    circulatingSupply: number
}

export const useFormattedMarketInfo = ({ marketInfo }: { marketInfo?: MarketInfo }) => {
    const { formatLocale } = useFormatFiat({ minimumFractionDigits: 0, maximumFractionDigits: 0 })
    const {
        totalVolume: _totalVolume,
        marketCap: _marketCap,
        totalSupply: _totalSupply,
        circulatingSupply: _circulatingSupply,
    } = marketInfo || {}

    const marketCap = useMemo(() => {
        return formatFiatAmount(_marketCap ?? 0, undefined, { locale: formatLocale })
    }, [_marketCap, formatLocale])

    const totalVolume = useMemo(() => {
        return formatFiatAmount(_totalVolume ?? 0, undefined, { locale: formatLocale })
    }, [_totalVolume, formatLocale])

    const totalSupply = useMemo(() => {
        return formatMarketData(_totalSupply ?? 0)
    }, [_totalSupply])

    const circulatingSupply = useMemo(() => {
        return formatMarketData(_circulatingSupply ?? 0)
    }, [_circulatingSupply])

    return {
        marketCap,
        totalVolume,
        totalSupply: totalSupply === "0" ? null : totalSupply,
        circulatingSupply: circulatingSupply === "0" ? null : circulatingSupply,
    }
}
