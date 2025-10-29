import React, { useState } from "react"
import { StyleSheet } from "react-native"
import Animated, { runOnJS, useDerivedValue } from "react-native-reanimated"
import { LineChart, useLineChart } from "react-native-wagmi-charts"
import { AnimatedFilterChips, BaseView } from "~Components"
import { COLORS, SCREEN_WIDTH } from "~Constants"
import { useThemedStyles } from "~Hooks"
// import ChartUtils from "~Utils/ChartUtils"

export type AssetChartPeriod = {
    days: number
    label: string
}

export const ASSET_CHART_PERIODS: AssetChartPeriod[] = [
    { days: 1, label: "1D" },
    { days: 7, label: "1W" },
    { days: 30, label: "1M" },
    { days: 180, label: "6M" },
    { days: 365, label: "1Y" },
    { days: 365 * 10, label: "All" },
]

type Props = {
    selectedPeriod: AssetChartPeriod
    setSelectedPeriod: (value: AssetChartPeriod) => void
}

const CHART_HEIGHT = 140
const CHART_STROKE_WIDTH = 3
// const HIGHLIGHT_RANGE = 10

export const AssetChart = ({ selectedPeriod, setSelectedPeriod }: Props) => {
    const { styles, theme } = useThemedStyles(baseStyles)
    const { data, currentIndex } = useLineChart()
    const [isCursorActive] = useState(false)
    const [indexRange, setIndexRange] = useState(0)

    // const isGoingUp = useMemo(() => ChartUtils.getPriceChange(data) >= 0, [data])

    useDerivedValue(() => {
        runOnJS(setIndexRange)(currentIndex.value)
        return currentIndex.value
    }, [currentIndex.value])

    return (
        <BaseView gap={24} flexDirection="column">
            <Animated.View testID="ASSET_DETAIL_SCREEN_CHART">
                <LineChart width={SCREEN_WIDTH} height={CHART_HEIGHT} yGutter={1}>
                    <LineChart.Path
                        color={theme.isDark ? COLORS.PURPLE_LABEL : COLORS.DARK_PURPLE_DISABLED}
                        showInactivePath={false}
                        width={CHART_STROKE_WIDTH}
                        pathProps={{ strokeLinejoin: "round", strokeLinecap: "round" }}>
                        <LineChart.Gradient fillOpacity={0.5} lastGradientValue={0} />
                        {isCursorActive && currentIndex.value > 0 && (
                            <>
                                <LineChart.Highlight
                                    from={indexRange === 0 ? indexRange + 1 : indexRange - 1}
                                    to={
                                        indexRange === (data?.length ?? 0) - 1
                                            ? (data?.length ?? 0) - 1
                                            : indexRange + 1
                                    }
                                    color={"white"}
                                    strokeLinecap={"round"}
                                    strokeLinejoin={"round"}
                                    width={CHART_STROKE_WIDTH}
                                    showInactiveColor={false}
                                />
                                <LineChart.Highlight
                                    from={indexRange === 0 ? indexRange + 1 : indexRange - 1}
                                    to={
                                        indexRange === (data?.length ?? 0) - 1
                                            ? (data?.length ?? 0) - 1
                                            : indexRange + 1
                                    }
                                    color={"white"}
                                    strokeLinecap={"round"}
                                    strokeLinejoin={"round"}
                                    strokeOpacity={0.3}
                                    strokeWidth={10}
                                    showInactiveColor={false}
                                />
                            </>
                        )}
                    </LineChart.Path>
                    <LineChart.CursorLine
                        lineProps={{
                            stroke: theme.isDark ? COLORS.PURPLE_LABEL : COLORS.DARK_PURPLE_DISABLED,
                            strokeDasharray: [0],
                        }}
                    />
                </LineChart>
            </Animated.View>
            <AnimatedFilterChips
                containerStyle={styles.chipContainer}
                items={ASSET_CHART_PERIODS}
                keyExtractor={item => item.days}
                getItemLabel={item => item.label}
                selectedItem={selectedPeriod}
                onItemPress={setSelectedPeriod}
            />
        </BaseView>
    )
}

const baseStyles = () =>
    StyleSheet.create({
        chipContainer: {
            marginHorizontal: 16,
        },
    })
