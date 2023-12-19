import React, { useCallback, useState } from "react"
import { LineChart } from "react-native-wagmi-charts"
import { BaseSpacer, PressableWithUnderline } from "~Components"
import { TokenWithCompleteInfo } from "~Model"
import { ChartView } from "./ChartView"
import HapticsService from "~Services/HapticsService"
import { selectCurrency, useAppSelector } from "~Storage/Redux"
import {
    MOCK_LINE_CHART_DATA,
    getCoinGeckoIdBySymbol,
    marketChartTimeframes,
    useCachedMarketChart,
} from "~Api/Coingecko"

type Props = {
    token: TokenWithCompleteInfo
}

const defaultTimeframe = marketChartTimeframes[0].value
export const AssetChart = ({ token }: Props) => {
    const [selectedTimeframe, setSelectedTimeframe] = useState<number>(defaultTimeframe)

    const currency = useAppSelector(selectCurrency)
    const { data: chartData, isLoading } = useCachedMarketChart({
        id: getCoinGeckoIdBySymbol[token.symbol],
        vs_currency: currency,
        days: selectedTimeframe,
    })

    const invokeHaptic = useCallback(async () => {
        await HapticsService.triggerImpact({ level: "Light" })
    }, [])

    const onTimelineButtonPress = useCallback((button: string) => {
        const foundData = marketChartTimeframes.find(o => o.label === button)
        setSelectedTimeframe(foundData?.value ?? defaultTimeframe)
    }, [])

    const isLoaded = chartData && !isLoading

    return (
        <>
            <LineChart.Provider
                data={chartData?.length ? chartData : MOCK_LINE_CHART_DATA}
                onCurrentIndexChange={invokeHaptic}>
                <ChartView chartData={chartData} token={token} isChartDataLoading={!isLoaded} />
            </LineChart.Provider>

            <BaseSpacer height={8} />

            <PressableWithUnderline onPress={onTimelineButtonPress} data={marketChartTimeframes} />
        </>
    )
}
