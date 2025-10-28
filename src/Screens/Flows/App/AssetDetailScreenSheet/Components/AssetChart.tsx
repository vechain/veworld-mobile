import React, { useMemo } from "react"
import { StyleSheet } from "react-native"
import Animated from "react-native-reanimated"
import { LineChart } from "react-native-wagmi-charts"
import { AnimatedFilterChips, BaseView } from "~Components"
import { COLORS, SCREEN_WIDTH } from "~Constants"
import { useThemedStyles } from "~Hooks"
import ChartUtils from "~Utils/ChartUtils"

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
    data:
        | {
              timestamp: number
              value: number
          }[]
        | undefined
}

const CHART_HEIGHT = 140
const CHART_STROKE_WIDTH = 3

export const AssetChart = ({ selectedPeriod, setSelectedPeriod, data }: Props) => {
    const { styles } = useThemedStyles(baseStyles)

    const isGoingUp = useMemo(() => ChartUtils.getPriceChange(data) >= 0, [data])
    return (
        <BaseView gap={24} flexDirection="column">
            <Animated.View testID="ASSET_DETAIL_SCREEN_CHART">
                <LineChart width={SCREEN_WIDTH} height={CHART_HEIGHT} yGutter={1}>
                    <LineChart.Path
                        color={isGoingUp ? COLORS.GREEN_300 : COLORS.RED_400}
                        width={CHART_STROKE_WIDTH}
                        pathProps={{ strokeLinejoin: "round", strokeLinecap: "round" }}
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
