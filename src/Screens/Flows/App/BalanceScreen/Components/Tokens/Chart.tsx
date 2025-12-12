import React, { useCallback, useMemo, useRef } from "react"
import { StyleSheet } from "react-native"
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated"
import { DEFAULT_LINE_CHART_DATA, getCoinGeckoIdBySymbol, useSmartMarketChartV2 } from "~Api/Coingecko"
import { LineChart } from "~Components/Reusable/LineChart"
import { COLORS } from "~Constants"
import { useThemedStyles } from "~Hooks"
import { FungibleToken } from "~Model"
import { selectCurrency, useAppSelector } from "~Storage/Redux"
import ChartUtils from "~Utils/ChartUtils"

// Chart configuration constants
export const CHART_WIDTH = 48
const CHART_HEIGHT = 32
const CHART_STROKE_WIDTH = 2

// Supported chart tokens (any token with CoinGecko ID supports charts)
const SUPPORTED_CHART_TOKENS = new Set(Object.keys(getCoinGeckoIdBySymbol))

type Props = {
    token: FungibleToken
}

export const Chart = ({ token }: Props) => {
    const currency = useAppSelector(selectCurrency)
    const { styles } = useThemedStyles(baseStyles)
    const opacity = useSharedValue(0)
    const rendered = useRef(false)

    // Early check for supported tokens to optimize API calls
    const isTokenSupported = SUPPORTED_CHART_TOKENS.has(token.symbol)

    const { data: chartData } = useSmartMarketChartV2({
        id: isTokenSupported ? getCoinGeckoIdBySymbol[token.symbol] : undefined,
        vs_currency: currency,
        days: 1,
        placeholderData: DEFAULT_LINE_CHART_DATA,
    })

    const isGoingUp = useMemo(() => ChartUtils.getPriceChange(chartData) >= 0, [chartData])
    const downsampled = useMemo(() => ChartUtils.downsampleData(chartData, "hour", 1), [chartData])

    const animatedStyles = useAnimatedStyle(() => {
        return {
            opacity: opacity.value,
        }
    }, [opacity.value])

    const onLayout = useCallback(() => {
        if (rendered.current) return
        rendered.current = true
        opacity.value = withTiming(1)
    }, [opacity])

    // Only render for supported tokens (parent already checked device/screen)
    if (!isTokenSupported) return null

    return (
        <Animated.View style={[styles.root, animatedStyles]} onLayout={onLayout} testID="TOKEN_CARD_CHART">
            <LineChart.Provider data={downsampled ?? DEFAULT_LINE_CHART_DATA}>
                <LineChart
                    width={CHART_WIDTH}
                    height={CHART_HEIGHT}
                    isInteractive={false}
                    strokeWidth={CHART_STROKE_WIDTH}
                    showGradientBackground={false}
                    strokeColor={isGoingUp ? COLORS.GREEN_300 : COLORS.RED_400}
                    xGutter={5}
                />
            </LineChart.Provider>
        </Animated.View>
    )
}

const baseStyles = () =>
    StyleSheet.create({
        root: {
            width: CHART_WIDTH,
            height: CHART_HEIGHT,
            alignItems: "center",
        },
    })
