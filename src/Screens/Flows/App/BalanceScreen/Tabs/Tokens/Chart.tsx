import React, { useMemo } from "react"
import { Animated, StyleSheet } from "react-native"
import { LineChart } from "react-native-wagmi-charts"
import {
    DEFAULT_LINE_CHART_DATA,
    getCoinGeckoIdBySymbol,
    MarketChartResponse,
    useSmartMarketChart,
} from "~Api/Coingecko"
import { B3TR, COLORS, isSmallScreen, VET, VTHO } from "~Constants"
import { useThemedStyles } from "~Hooks"
import { FungibleToken } from "~Model"
import { selectCurrency, useAppSelector } from "~Storage/Redux"

type Props = {
    token: FungibleToken
}

/**
 * Get the price change in the timeframe passed
 * @returns The price change
 */
const getPriceChange = (data?: MarketChartResponse) => {
    // Use chart data if available so the change is sycned with the asset charts,
    // otherwise fallback to the token info change
    if (data?.length) {
        const openPrice = data[0]?.value
        const closePrice = data[data.length - 1]?.value

        if (openPrice && closePrice) {
            return closePrice - openPrice
        }
    }
    return 0
}

export const Chart = ({ token }: Props) => {
    const currency = useAppSelector(selectCurrency)
    const { styles } = useThemedStyles(baseStyles)
    const { data: chartData } = useSmartMarketChart({
        id: getCoinGeckoIdBySymbol[token.symbol],
        vs_currency: currency,
        days: 1,
        placeholderData: DEFAULT_LINE_CHART_DATA,
    })

    const isGoingUp = useMemo(() => getPriceChange(chartData) >= 0, [chartData])

    if (![B3TR.symbol, VET.symbol, VTHO.symbol].includes(token.symbol)) return null

    return (
        <Animated.View style={styles.root}>
            <LineChart.Provider data={chartData ?? DEFAULT_LINE_CHART_DATA}>
                <LineChart width={isSmallScreen ? 60 : 120} height={32} yGutter={1}>
                    <LineChart.Path color={isGoingUp ? COLORS.GREEN_300 : COLORS.RED_400} width={3} />
                </LineChart>
            </LineChart.Provider>
        </Animated.View>
    )
}

const baseStyles = () =>
    StyleSheet.create({
        root: {
            height: 32,
        },
    })
