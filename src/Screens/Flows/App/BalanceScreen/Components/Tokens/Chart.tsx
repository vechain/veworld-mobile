import React, { useMemo } from "react"
import { Animated, StyleSheet } from "react-native"
import { LineChart } from "react-native-wagmi-charts"
import { DEFAULT_LINE_CHART_DATA, getCoinGeckoIdBySymbol, useSmartMarketChart } from "~Api/Coingecko"
import { B3TR, COLORS, SCREEN_WIDTH, VET, VTHO } from "~Constants"
import { useThemedStyles } from "~Hooks"
import { FungibleToken } from "~Model"
import { selectCurrency, useAppSelector } from "~Storage/Redux"
import ChartUtils from "~Utils/ChartUtils"

type Props = {
    token: FungibleToken
}

export const CAN_DISPLAY_CHART = SCREEN_WIDTH >= 450

export const Chart = ({ token }: Props) => {
    const currency = useAppSelector(selectCurrency)
    const { styles } = useThemedStyles(baseStyles)
    const { data: chartData } = useSmartMarketChart({
        id: getCoinGeckoIdBySymbol[token.symbol],
        vs_currency: currency,
        days: 1,
        placeholderData: DEFAULT_LINE_CHART_DATA,
    })

    const isGoingUp = useMemo(() => ChartUtils.getPriceChange(chartData) >= 0, [chartData])

    const downsampled = useMemo(() => ChartUtils.downsampleData(chartData), [chartData])

    if (!CAN_DISPLAY_CHART) return null
    if (![B3TR.symbol, VET.symbol, VTHO.symbol].includes(token.symbol)) return null

    return (
        <Animated.View style={styles.root}>
            <LineChart.Provider data={downsampled ?? DEFAULT_LINE_CHART_DATA}>
                <LineChart width={120} height={32} yGutter={1}>
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
            flex: 1,
        },
    })
