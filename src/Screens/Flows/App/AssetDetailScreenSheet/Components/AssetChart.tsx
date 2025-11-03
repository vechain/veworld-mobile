import React from "react"
import { StyleSheet } from "react-native"
import Animated from "react-native-reanimated"
import { AnimatedFilterChips, BaseView } from "~Components"
import { LineChart } from "~Components/Reusable/LineChart"
import { SCREEN_WIDTH } from "~Constants"
import { useThemedStyles } from "~Hooks"

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

const CHART_HEIGHT = 125

export const AssetChart = ({ selectedPeriod, setSelectedPeriod }: Props) => {
    const { styles } = useThemedStyles(baseStyles)

    return (
        <BaseView gap={24} flexDirection="column">
            <Animated.View testID="ASSET_DETAIL_SCREEN_CHART">
                <LineChart width={SCREEN_WIDTH} height={CHART_HEIGHT} />
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
