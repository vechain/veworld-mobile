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

type Props = {
    chartData?: TokenChartData[]
    isChartDataLoading: boolean
    token: TokenWithCompleteInfo
}

export const ChartView = ({ chartData, token, isChartDataLoading }: Props) => {
    const { LL } = useI18nContext()

    const invokeHaptic = () => {
        haptics.impactAsync(haptics.ImpactFeedbackStyle.Light)
    }

    const { styles, theme } = useThemedStyles(baseStyles)

    const _chartView = useMemo(() => {
        if (chartData?.length) {
            return (
                <BaseView flexDirection="row" w={100} alignItems="flex-end" style={[styles.container]}>
                    <LineChart height={180} width={SCREEN_WIDTH - 32} yGutter={30}>
                        <LineChart.Path color={theme.colors.graphLine} width={2}>
                            <LineChart.Gradient color={theme.colors.graphGradient} lastGradientValue={0.02} />
                        </LineChart.Path>

                        <LineChart.CursorCrosshair onActivated={invokeHaptic} onEnded={invokeHaptic} />

                        <LineChart.CursorLine />
                    </LineChart>
                </BaseView>
            )
        } else {
            return (
                <BaseView justifyContent="center" alignItems="center" style={[styles.container]}>
                    <BaseView>
                        <LineChart height={160} style={styles.opacity}>
                            <LineChart.Path color={theme.colors.graphLine} width={0}>
                                <LineChart.Gradient color={theme.colors.graphGradient} lastGradientValue={0} />
                            </LineChart.Path>
                        </LineChart>
                        <BaseView justifyContent="center" alignItems="center">
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
        styles.container,
        styles.opacity,
        theme.colors.graphGradient,
        theme.colors.graphLine,
        token.name,
    ])

    return (
        <>
            <BaseView flexDirection="row" justifyContent="space-between" w={100} px={16}>
                <AssetPriceBanner isChartDataLoading={isChartDataLoading} />
            </BaseView>

            <BaseSpacer height={16} />

            {_chartView}
        </>
    )
}

const baseStyles = () =>
    StyleSheet.create({
        priceText: { opacity: 0 },
        container: { maxHeight: 160, paddingHorizontal: 16 },
        opacity: { opacity: 0.4 },
    })
