import React, { useCallback, useMemo, useRef } from "react"
import { LayoutChangeEvent, StyleSheet } from "react-native"
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated"
import { LineChart } from "react-native-wagmi-charts"
import { DEFAULT_LINE_CHART_DATA, getCoinGeckoIdBySymbol, useSmartMarketChart } from "~Api/Coingecko"
import { COLORS } from "~Constants"
import { useThemedStyles } from "~Hooks"
import { FungibleToken } from "~Model"
import { selectCurrency, useAppSelector } from "~Storage/Redux"
import ChartUtils from "~Utils/ChartUtils"

// Chart configuration constants
const CHART_WIDTH = 60
const CHART_HEIGHT = 32
const CHART_STROKE_WIDTH = 2

// Supported chart tokens (any token with CoinGecko ID supports charts)
const SUPPORTED_CHART_TOKENS = new Set(Object.keys(getCoinGeckoIdBySymbol))

type Props = {
    token: FungibleToken
    setShowChart: (value: boolean) => void
    showChart: boolean
}

export const Chart = ({ token, setShowChart, showChart }: Props) => {
    const currency = useAppSelector(selectCurrency)
    const { styles } = useThemedStyles(baseStyles)
    const opacity = useSharedValue(0)
    const rendered = useRef(false)

    // Early check for supported tokens to optimize API calls
    const isTokenSupported = SUPPORTED_CHART_TOKENS.has(token.symbol)

    const { data: chartData } = useSmartMarketChart({
        id: isTokenSupported ? getCoinGeckoIdBySymbol[token.symbol] : undefined,
        vs_currency: currency,
        days: 1,
        placeholderData: DEFAULT_LINE_CHART_DATA,
    })

    const isGoingUp = useMemo(() => ChartUtils.getPriceChange(chartData) >= 0, [chartData])
    const downsampled = useMemo(() => ChartUtils.downsampleData(chartData, "hour", 1), [chartData])

    const shouldDisplayChart = useMemo(() => {
        if (!isTokenSupported) {
            return false
        }

        return showChart
    }, [isTokenSupported, showChart])

    const animatedStyles = useAnimatedStyle(() => {
        return {
            opacity: opacity.value,
        }
    }, [opacity.value])

    const onLayout = useCallback(
        (e: LayoutChangeEvent) => {
            if (rendered.current) return
            rendered.current = true
            if (e.nativeEvent.layout.width < CHART_WIDTH) {
                setShowChart(false)
            } else opacity.value = withTiming(1)
        },
        [opacity, setShowChart],
    )

    if (!shouldDisplayChart) return null

    return (
        <Animated.View style={[styles.root, animatedStyles]} onLayout={onLayout}>
            <LineChart.Provider data={downsampled ?? DEFAULT_LINE_CHART_DATA}>
                <LineChart width={CHART_WIDTH} height={CHART_HEIGHT} yGutter={1}>
                    <LineChart.Path
                        color={isGoingUp ? COLORS.GREEN_300 : COLORS.RED_400}
                        width={CHART_STROKE_WIDTH}
                        pathProps={{ strokeLinejoin: "round", strokeLinecap: "round" }}
                    />
                </LineChart>
            </LineChart.Provider>
        </Animated.View>
    )
}

const baseStyles = () =>
    StyleSheet.create({
        root: {
            height: CHART_HEIGHT,
            flex: 1,
            alignItems: "center",
        },
    })
