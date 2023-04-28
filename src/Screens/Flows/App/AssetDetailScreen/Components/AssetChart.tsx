import { Dimensions, StyleSheet } from "react-native"
import React, { useCallback } from "react"
import { LineChart } from "react-native-wagmi-charts"
import { ColorThemeType, info, useThemedStyles } from "~Common"
import * as haptics from "expo-haptics"
import {
    BaseSpacer,
    BaseText,
    BaseView,
    PressableWithUnderline,
} from "~Components"
import { AssetPriceBanner } from "./AssetPriceBanner"
import { useChartData } from "../Hooks/useChartData"

type Props = {
    symbol: string
    change?: number
}

const Y_AXIS_WIDTH = 40
const PADDING = 20
const SPACE = PADDING * 2 + Y_AXIS_WIDTH

export const AssetChart = ({ symbol, change = 0 }: Props) => {
    const { chartData, yAxisLabels, xAxisLabels } = useChartData(symbol)

    function invokeHaptic() {
        haptics.impactAsync(haptics.ImpactFeedbackStyle.Light)
    }

    const { styles, theme } = useThemedStyles(baseStyles)

    const onTimelineButtonPress = useCallback((button: number) => {
        info("onTimelineButtonPress", button)
    }, [])

    return (
        <>
            <LineChart.Provider data={chartData}>
                <BaseView
                    flexDirection="row"
                    justifyContent="space-between"
                    w={100}>
                    <AssetPriceBanner change={change} />
                </BaseView>

                <BaseSpacer height={24} />

                <BaseView
                    flexDirection="row"
                    w={100}
                    alignItems="flex-end"
                    style={styles.container}>
                    <LineChart
                        height={180}
                        width={Dimensions.get("window").width - SPACE}
                        yGutter={20}>
                        <LineChart.Path color={theme.colors.primary}>
                            <LineChart.Gradient />
                        </LineChart.Path>

                        <LineChart.CursorCrosshair />

                        <LineChart.CursorLine
                            onActivated={invokeHaptic}
                            onEnded={invokeHaptic}
                        />
                    </LineChart>

                    <BaseView
                        justifyContent="space-around"
                        alignItems="flex-start"
                        pl={6}
                        h={100}
                        style={{ width: Y_AXIS_WIDTH }}>
                        {yAxisLabels.map((label, index) => (
                            <BaseText key={label} typographyFont="smallCaption">
                                {label.toFixed(
                                    index === yAxisLabels.length - 1 ? 0 : 4,
                                )}
                            </BaseText>
                        ))}
                    </BaseView>
                </BaseView>
            </LineChart.Provider>

            <BaseView
                flexDirection="row"
                style={{ width: Dimensions.get("window").width - SPACE }}>
                {xAxisLabels.map((label, index) => (
                    <BaseText key={index} typographyFont="smallCaption">
                        {label}
                    </BaseText>
                ))}
            </BaseView>

            <BaseSpacer height={16} />

            <PressableWithUnderline onPress={onTimelineButtonPress} />
        </>
    )
}

const baseStyles = (_theme: ColorThemeType) =>
    StyleSheet.create({
        priceText: { opacity: 0 },
        container: { maxHeight: 180 },
    })
