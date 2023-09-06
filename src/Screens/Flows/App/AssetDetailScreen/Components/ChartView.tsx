import { StyleSheet } from "react-native"
import React, { useMemo } from "react"
import { LineChart } from "react-native-wagmi-charts"
import { SCREEN_WIDTH } from "~Constants"
import { useThemedStyles } from "~Hooks"
import * as haptics from "expo-haptics"
import { BaseSpacer, BaseText, BaseView } from "~Components"
import { AssetPriceBanner } from "./AssetPriceBanner"
import { TokenWithCompleteInfo } from "~Model"
import { useI18nContext } from "~i18n"

type TokenChartData = {
    timestamp: number
    value: number
}

export const ChartView = ({
    chartData,
    token,
}: {
    chartData: TokenChartData[]
    token: TokenWithCompleteInfo
}) => {
    const { LL } = useI18nContext()

    const invokeHaptic = () => {
        haptics.impactAsync(haptics.ImpactFeedbackStyle.Light)
    }

    const { styles, theme } = useThemedStyles(baseStyles)

    const _chartView = useMemo(() => {
        if (chartData?.length) {
            return (
                <BaseView
                    flexDirection="row"
                    w={100}
                    alignItems="flex-end"
                    style={[styles.container, styles.negativeMargin]}>
                    <LineChart height={180} width={SCREEN_WIDTH} yGutter={20}>
                        <LineChart.Path color={theme.colors.primary} width={2}>
                            <LineChart.Gradient lastGradientValue={0} />
                        </LineChart.Path>

                        <LineChart.CursorCrosshair
                            onActivated={invokeHaptic}
                            onEnded={invokeHaptic}
                        />

                        <LineChart.CursorLine />
                    </LineChart>
                </BaseView>
            )
        } else {
            return (
                <BaseView
                    justifyContent="center"
                    alignItems="center"
                    style={[styles.negativeMargin, styles.container]}>
                    <BaseView>
                        <LineChart height={120} style={styles.opacity}>
                            <LineChart.Path
                                color={theme.colors.primary}
                                width={0}>
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
            )
        }
    }, [
        LL,
        chartData?.length,
        styles.absolutePosition,
        styles.container,
        styles.negativeMargin,
        styles.opacity,
        theme.colors.primary,
        token.name,
    ])

    return (
        <>
            <BaseView
                flexDirection="row"
                justifyContent="space-between"
                w={100}>
                <AssetPriceBanner symbol={token.symbol} />
            </BaseView>

            <BaseSpacer height={24} />

            {_chartView}
        </>
    )
}

const baseStyles = () =>
    StyleSheet.create({
        priceText: { opacity: 0 },
        container: { maxHeight: 180 },
        negativeMargin: { marginLeft: -24 },
        fullWidth: { width: SCREEN_WIDTH - 20 * 2 },
        absolutePosition: {
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
        },
        opacity: { opacity: 0.4 },
    })
