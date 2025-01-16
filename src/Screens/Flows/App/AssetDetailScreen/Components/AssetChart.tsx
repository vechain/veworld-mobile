import React, { useCallback, useEffect, useState } from "react"
import { LineChart } from "react-native-wagmi-charts"
import { BaseSpacer, BaseView, PressableWithUnderline } from "~Components"
import { TokenWithCompleteInfo } from "~Model"
import { ChartView } from "./ChartView"
import HapticsService from "~Services/HapticsService"
import { selectCurrency, useAppSelector } from "~Storage/Redux"
import {
    MOCK_LINE_CHART_DATA,
    MarketChartResponse,
    getCoinGeckoIdBySymbol,
    getMarketChart,
    getMarketChartQueryKey,
    getSmartMarketChart,
    marketChartTimeframes,
    useSmartMarketChart,
} from "~Api/Coingecko"
import { useQueryClient } from "@tanstack/react-query"
import { max } from "lodash"

type Props = {
    token: TokenWithCompleteInfo
}

const defaultTimeframe = marketChartTimeframes[0]
export const AssetChart = ({ token }: Props) => {
    const queryClient = useQueryClient()
    const [selectedTimeframe, setSelectedTimeframe] = useState<number>(defaultTimeframe.value)
    const [fakeLoading, setFakeLoading] = useState<boolean>(false)

    const currency = useAppSelector(selectCurrency)
    const { data: chartData, isLoading } = useSmartMarketChart({
        id: getCoinGeckoIdBySymbol[token.symbol],
        vs_currency: currency,
        days: selectedTimeframe,
    })

    const invokeHaptic = useCallback(async () => {
        await HapticsService.triggerImpact({ level: "Light" })
    }, [])

    const onTimelineButtonPress = useCallback((button: string) => {
        setFakeLoading(true)
        const foundData = marketChartTimeframes.find(o => o.label === button)
        setSelectedTimeframe(foundData?.value ?? defaultTimeframe.value)
        //to avoid flickerings and errors in AssetPriceBanner, which is using the chartData
        setTimeout(() => {
            setFakeLoading(false)
        }, 400)
    }, [])

    const isLoaded = chartData && !isLoading && !fakeLoading

    //prefetch the other timeframes (locally derived) when the timeframe changes
    //prefetching does nothing if the data is already cached
    useEffect(() => {
        const prefetchTimeframesData = async () => {
            const highestResolutionTimeframeDays = max(marketChartTimeframes.map(timeframe => timeframe.value)) ?? 180
            const highestTimeframeData = queryClient.getQueryData<MarketChartResponse>(
                getMarketChartQueryKey({
                    id: getCoinGeckoIdBySymbol[token.symbol],
                    vs_currency: currency,
                    days: highestResolutionTimeframeDays,
                }),
            )
            for (const timeframe of marketChartTimeframes) {
                if (timeframe.value !== selectedTimeframe) {
                    await queryClient.prefetchQuery({
                        queryKey: getMarketChartQueryKey({
                            id: getCoinGeckoIdBySymbol[token.symbol],
                            vs_currency: currency,
                            days: timeframe.value,
                        }),
                        queryFn: () =>
                            timeframe.value > 1
                                ? getSmartMarketChart({
                                      highestResolutionMarketChartData: highestTimeframeData,
                                      days: timeframe.value,
                                  })
                                : // Handle the daily timeframe to get data every 5
                                  getMarketChart({
                                      coinGeckoId: getCoinGeckoIdBySymbol[token.symbol],
                                      vs_currency: currency,
                                      days: 1,
                                  }),
                    })
                }
            }
        }
        prefetchTimeframesData()
    }, [chartData, queryClient, currency, token.symbol, selectedTimeframe])

    return (
        <>
            <LineChart.Provider
                data={chartData?.length ? chartData : MOCK_LINE_CHART_DATA}
                onCurrentIndexChange={invokeHaptic}>
                <ChartView chartData={chartData} token={token} isChartDataLoading={!isLoaded} />
            </LineChart.Provider>

            <BaseSpacer height={12} />

            <BaseView px={16}>
                <PressableWithUnderline onPress={onTimelineButtonPress} data={marketChartTimeframes} />
            </BaseView>
        </>
    )
}
