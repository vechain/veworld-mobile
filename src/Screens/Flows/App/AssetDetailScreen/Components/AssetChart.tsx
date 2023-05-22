import React, { useCallback } from "react"
import { LineChart } from "react-native-wagmi-charts"
import * as haptics from "expo-haptics"
import { BaseSpacer, PressableWithUnderline } from "~Components"
import { useChartData } from "../Hooks/useChartData"
import { TokenWithCompleteInfo } from "~Model"
import { mock_cart_data, timelineDays } from "../Mock_Chart_Data"
import { ChartView } from "./ChartView"

type Props = {
    token: TokenWithCompleteInfo
}

export const AssetChart = ({ token }: Props) => {
    const { chartData, getChartData } = useChartData(token.symbol)

    const invokeHaptic = () => {
        if (chartData && chartData.length)
            haptics.impactAsync(haptics.ImpactFeedbackStyle.Light)
    }

    const onTimelineButtonPress = useCallback(
        (button: string) => {
            const foundData = timelineDays.find(o => o.label === button)
            getChartData(foundData?.value, foundData?.secondaryValue)
        },
        [getChartData],
    )

    return (
        <>
            <LineChart.Provider
                data={chartData?.length ? chartData : mock_cart_data}
                onCurrentIndexChange={invokeHaptic}>
                <ChartView chartData={chartData} token={token} />
            </LineChart.Provider>

            <BaseSpacer height={8} />

            <PressableWithUnderline
                onPress={onTimelineButtonPress}
                data={timelineDays}
            />
        </>
    )
}
