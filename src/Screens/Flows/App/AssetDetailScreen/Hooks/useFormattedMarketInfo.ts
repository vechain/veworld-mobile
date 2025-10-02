import { useMemo } from "react"
import { useFormatFiat } from "~Hooks/useFormatFiat"
import { BigNutils } from "~Utils"

export type MarketInfo = {
    marketCap: number
    totalSupply: number | null
    totalVolume: number
    circulatingSupply: number
}

export const useFormattedMarketInfo = ({ marketInfo }: { marketInfo?: MarketInfo }) => {
    const { formatFiat } = useFormatFiat({ minimumFractionDigits: 0, maximumFractionDigits: 0 })
    const {
        totalVolume: _totalVolume,
        marketCap: _marketCap,
        totalSupply: _totalSupply,
        circulatingSupply: _circulatingSupply,
    } = marketInfo || {}

    const marketCap = useMemo(() => formatFiat({ amount: _marketCap }), [formatFiat, _marketCap])
    const totalVolume = useMemo(() => formatFiat({ amount: _totalVolume }), [formatFiat, _totalVolume])

    const totalSupply = useMemo(() => {
        return BigNutils(_totalSupply ?? 0).toTokenFormat_string(0)
    }, [_totalSupply])

    const circulatingSupply = useMemo(() => {
        return BigNutils(_circulatingSupply ?? 0).toCurrencyFormat_string(0)
    }, [_circulatingSupply])

    return {
        marketCap,
        totalVolume,
        totalSupply: totalSupply === "0" ? null : totalSupply,
        circulatingSupply: circulatingSupply === "0" ? null : circulatingSupply,
    }
}
