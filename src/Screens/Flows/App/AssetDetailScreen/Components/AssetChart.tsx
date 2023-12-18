import React, { useCallback, useState } from "react"
import { LineChart } from "react-native-wagmi-charts"
import { BaseSpacer, PressableWithUnderline } from "~Components"
import { TokenWithCompleteInfo } from "~Model"
import { mock_cart_data, timelineDays } from "../Mock_Chart_Data"
import { ChartView } from "./ChartView"
import HapticsService from "~Services/HapticsService"
import { MarketChartResponse, useMarketChart } from "~Api"
import { getCoinGeckoIdBySymbol } from "~Constants"
import { selectCurrency, useAppSelector } from "~Storage/Redux"

type Props = {
    token: TokenWithCompleteInfo
}

const defaultTimeframe = timelineDays[0].value
export const AssetChart = ({ token }: Props) => {
    const [selectedTimeframe, setSelectedTimeframe] =
        useState<number>(defaultTimeframe)

    const currency = useAppSelector(selectCurrency)
    const { data: chartData } = useMarketChart({
        id: getCoinGeckoIdBySymbol[token.symbol],
        vs_currency: currency,
        days: selectedTimeframe,
        placeholderData: mock_cart_data,
    })

    const invokeHaptic = useCallback(async () => {
        await HapticsService.triggerImpact({ level: "Light" })
    }, [])

    const onTimelineButtonPress = useCallback((button: string) => {
        const foundData = timelineDays.find(o => o.label === button)
        setSelectedTimeframe(foundData?.value ?? defaultTimeframe)
    }, [])

    return (
        <>
            <LineChart.Provider
                data={chartData?.length ? chartData : mock_cart_data}
                onCurrentIndexChange={invokeHaptic}>
                {/* chartData is always defined because we are passing initalData */}
                <ChartView
                    chartData={chartData as MarketChartResponse}
                    token={token}
                />
            </LineChart.Provider>

            <BaseSpacer height={8} />

            <PressableWithUnderline
                onPress={onTimelineButtonPress}
                data={timelineDays}
            />
        </>
    )
}
