import { useMemo } from "react"
import { FormattingUtils } from "~Utils"

import { selectCurrency, useAppSelector } from "~Storage/Redux"

export type MarketInfo = {
    marketCap: number
    totalSupply: number
    totalVolume: number
    circulatingSupply: number
}

export const useFormattedMarketInfo = ({
    marketInfo,
    tokenSymbol,
}: {
    marketInfo?: MarketInfo
    tokenSymbol: string
}) => {
    const currency = useAppSelector(selectCurrency)

    const marketCap = useMemo(() => {
        return FormattingUtils.humanNumber(
            marketInfo?.marketCap ?? 0,
            undefined,
            currency,
        )
    }, [currency, marketInfo?.marketCap])

    const totalSupply = useMemo(() => {
        return FormattingUtils.humanNumber(
            marketInfo?.totalSupply ?? 0,
            undefined,
            tokenSymbol,
        )
    }, [tokenSymbol, marketInfo?.totalSupply])

    const totalVolume = useMemo(() => {
        return FormattingUtils.humanNumber(
            marketInfo?.totalVolume ?? 0,
            undefined,
            currency,
        )
    }, [currency, marketInfo?.totalVolume])

    const circulatingSupply = useMemo(() => {
        return FormattingUtils.humanNumber(
            marketInfo?.circulatingSupply ?? 0,
            undefined,
            tokenSymbol,
        )
    }, [tokenSymbol, marketInfo?.circulatingSupply])

    return {
        marketCap: marketCap === "< 0.01 USD" ? "N/A" : marketCap,
        totalSupply:
            totalSupply === `< 0.01 ${tokenSymbol}` ? "N/A" : totalSupply,
        totalVolume: totalVolume === "< 0.01 USD" ? "N/A" : totalVolume,
        circulatingSupply:
            circulatingSupply === `< 0.01 ${tokenSymbol}`
                ? "N/A"
                : circulatingSupply,
    }
}
