import React, { useMemo } from "react"
import { StyleSheet, View } from "react-native"
import { LineChart } from "react-native-wagmi-charts"
import { DEFAULT_LINE_CHART_DATA, getCoinGeckoIdBySymbol, useSmartMarketChart } from "~Api/Coingecko"
import { B3TR, COLORS, SCREEN_WIDTH, VET, VTHO } from "~Constants"
import { useThemedStyles } from "~Hooks"
import { FungibleToken } from "~Model"
import { selectCurrency, useAppSelector } from "~Storage/Redux"
import ChartUtils from "~Utils/ChartUtils"

// Chart configuration constants
const CHART_WIDTH = 90
const CHART_HEIGHT = 32
const CHART_PADDING = 8
const CHART_STROKE_WIDTH = 3

const MIN_CHART_SPACE = CHART_WIDTH + CHART_PADDING
const B3TR_EXTRA_SPACE = 20
const FALLBACK_SCREEN_THRESHOLD = 450
// Supported chart tokens (constant to avoid array recreation)
const SUPPORTED_CHART_TOKENS = new Set([B3TR.symbol, VET.symbol, VTHO.symbol])

type Props = {
    token: FungibleToken
    availableWidth?: number
}

export const Chart = ({ token, availableWidth }: Props) => {
    const currency = useAppSelector(selectCurrency)
    const { styles } = useThemedStyles(baseStyles)

    // Early check for supported tokens to optimize API calls
    const isTokenSupported = SUPPORTED_CHART_TOKENS.has(token.symbol)

    const { data: chartData } = useSmartMarketChart({
        id: isTokenSupported ? getCoinGeckoIdBySymbol[token.symbol] : undefined,
        vs_currency: currency,
        days: 1,
        placeholderData: DEFAULT_LINE_CHART_DATA,
    })

    const isGoingUp = useMemo(() => ChartUtils.getPriceChange(chartData) >= 0, [chartData])
    const downsampled = useMemo(() => ChartUtils.downsampleData(chartData, "hour", 4), [chartData])

    const shouldDisplayChart = useMemo(() => {
        if (!isTokenSupported) {
            return false
        }

        // Use available width if provided, otherwise fallback to screen width
        if (availableWidth !== undefined) {
            const requiredSpace = token.symbol === B3TR.symbol ? MIN_CHART_SPACE + B3TR_EXTRA_SPACE : MIN_CHART_SPACE
            return availableWidth >= requiredSpace
        }

        return SCREEN_WIDTH >= FALLBACK_SCREEN_THRESHOLD
    }, [isTokenSupported, availableWidth, token.symbol])

    if (!shouldDisplayChart) return null

    return (
        <View style={styles.root}>
            <LineChart.Provider data={downsampled ?? DEFAULT_LINE_CHART_DATA}>
                <LineChart width={CHART_WIDTH} height={CHART_HEIGHT} yGutter={1}>
                    <LineChart.Path
                        color={isGoingUp ? COLORS.GREEN_300 : COLORS.RED_400}
                        width={CHART_STROKE_WIDTH}
                        pathProps={{ strokeLinejoin: "round", strokeLinecap: "round" }}
                    />
                </LineChart>
            </LineChart.Provider>
        </View>
    )
}

const baseStyles = () =>
    StyleSheet.create({
        root: {
            height: CHART_HEIGHT,
            flex: 1,
        },
    })
