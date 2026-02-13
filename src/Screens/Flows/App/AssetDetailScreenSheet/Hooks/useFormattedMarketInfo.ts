import { useMemo } from "react"
import { useFormatFiat } from "~Hooks/useFormatFiat"
import { formatMarketData, formatFiatAmount } from "~Utils/StandardizedFormatting"

export type MarketInfo = {
    marketCap: number
    totalSupply: number | null
    totalVolume: number
    circulatingSupply: number
    high24h?: number
    low24h?: number
}

export const useFormattedMarketInfo = ({ marketInfo }: { marketInfo?: MarketInfo }) => {
    const { formatLocale } = useFormatFiat({ minimumFractionDigits: 0, maximumFractionDigits: 0 })
    const {
        totalVolume: _totalVolume,
        marketCap: _marketCap,
        totalSupply: _totalSupply,
        circulatingSupply: _circulatingSupply,
        high24h: _high24h,
        low24h: _low24h,
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

    const high24h = useMemo(() => {
        if (!_high24h) return null
        return formatFiatAmount(_high24h, undefined, {
            locale: formatLocale,
            forceDecimals: 5,
            skipThreshold: true,
        })
    }, [_high24h, formatLocale])

    const low24h = useMemo(() => {
        if (!_low24h) return null
        return formatFiatAmount(_low24h, undefined, {
            locale: formatLocale,
            forceDecimals: 5,
            skipThreshold: true,
        })
    }, [_low24h, formatLocale])

    return {
        marketCap,
        totalVolume,
        totalSupply: totalSupply === "0" ? null : totalSupply,
        circulatingSupply: circulatingSupply === "0" ? null : circulatingSupply,
        high24h,
        low24h,
    }
}
