import { Dimensions, StyleSheet } from "react-native"
import React, { useCallback } from "react"
import { LineChart } from "react-native-wagmi-charts"
import { ColorThemeType, useThemedStyles } from "~Common"
import * as haptics from "expo-haptics"
import {
    BaseSpacer,
    BaseText,
    BaseView,
    PressableWithUnderline,
} from "~Components"
import { AssetPriceBanner } from "./AssetPriceBanner"
import { useChartData } from "../Hooks/useChartData"
import { TokenWithCompleteInfo } from "~Model"
import { useI18nContext } from "~i18n"
import { mock_cart_data, timelineDays } from "../Mock_Chart_Data"

type Props = {
    token: TokenWithCompleteInfo
}

const PADDING = 20
const SPACE = Dimensions.get("window").width

export const AssetChart = ({ token }: Props) => {
    const { LL } = useI18nContext()

    const { chartData, getChartData } = useChartData(token.symbol)

    const invokeHaptic = () => {
        haptics.impactAsync(haptics.ImpactFeedbackStyle.Light)
    }

    const { styles, theme } = useThemedStyles(baseStyles)

    const onTimelineButtonPress = useCallback(
        (button: string) => {
            const foundData = timelineDays.find(o => o.label === button)
            getChartData(foundData?.value, foundData?.secondaryValue)
        },
        [getChartData],
    )

    const isVechainToken =
        token.symbol.toLowerCase().trim() === "vet" ||
        token.symbol.toLowerCase().trim() === "vtho"

    if (isVechainToken) {
        return (
            <>
                <LineChart.Provider
                    data={chartData}
                    onCurrentIndexChange={invokeHaptic}>
                    <BaseView
                        flexDirection="row"
                        justifyContent="space-between"
                        w={100}>
                        <AssetPriceBanner />
                    </BaseView>

                    <BaseSpacer height={24} />

                    <BaseView
                        flexDirection="row"
                        w={100}
                        alignItems="flex-end"
                        style={[styles.container, styles.negativeMargin]}>
                        <LineChart height={180} width={SPACE} yGutter={20}>
                            <LineChart.Path
                                color={theme.colors.primary}
                                width={2}>
                                <LineChart.Gradient lastGradientValue={0} />
                            </LineChart.Path>

                            <LineChart.CursorCrosshair
                                onActivated={invokeHaptic}
                                onEnded={invokeHaptic}
                            />

                            <LineChart.CursorLine />
                        </LineChart>
                    </BaseView>
                </LineChart.Provider>

                <BaseSpacer height={8} />

                <PressableWithUnderline
                    onPress={onTimelineButtonPress}
                    data={timelineDays}
                />
            </>
        )
    }

    return (
        <LineChart.Provider data={mock_cart_data}>
            <BaseView
                flexDirection="row"
                justifyContent="space-between"
                w={100}>
                <AssetPriceBanner token={token} />
            </BaseView>

            <BaseSpacer height={24} />

            <BaseView
                justifyContent="center"
                alignItems="center"
                style={[styles.negativeMargin, styles.container]}>
                <BaseView>
                    <LineChart height={120} style={styles.opacity}>
                        <LineChart.Path color={theme.colors.primary} width={0}>
                            <LineChart.Gradient lastGradientValue={0} />
                        </LineChart.Path>
                    </LineChart>
                    <BaseView
                        style={styles.absolutePosition}
                        justifyContent="center"
                        alignItems="center">
                        <BaseText typographyFont="bodyBold">
                            {LL.COMMON_LBL_NO_TOKEN_DATA({
                                tokenName: token.name,
                            })}
                        </BaseText>
                    </BaseView>
                </BaseView>
            </BaseView>
        </LineChart.Provider>
    )
}

const baseStyles = (_theme: ColorThemeType) =>
    StyleSheet.create({
        priceText: { opacity: 0 },
        container: { maxHeight: 180 },
        negativeMargin: { marginLeft: -20 },
        fullWidth: { width: SPACE - PADDING * 2 },
        absolutePosition: {
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
        },
        opacity: { opacity: 0.4 },
    })
