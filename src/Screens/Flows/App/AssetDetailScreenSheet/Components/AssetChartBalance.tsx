import React from "react"
import { useDerivedValue } from "react-native-reanimated"
import { useLineChart } from "react-native-wagmi-charts"
import { BaseIcon, BaseText, BaseView } from "~Components"
import { COLORS } from "~Constants"
import { useFormatFiat, useTheme } from "~Hooks"
import { selectBalanceVisible, selectCurrencySymbol, useAppSelector } from "~Storage/Redux"
import { ReanimatedUtils } from "~Utils"
import { useLineChartPrice } from "../../AssetDetailScreen/Hooks/usePrice"

export const AssertChartBalance = () => {
    const { value } = useLineChartPrice()
    const { data } = useLineChart()
    const { formatLocale } = useFormatFiat()
    const isBalanceVisible = useAppSelector(selectBalanceVisible)
    const theme = useTheme()
    const currencySymbol = useAppSelector(selectCurrencySymbol)

    const formatted = useDerivedValue(() => {
        return ReanimatedUtils.formatFiatWorklet(value.value, currencySymbol, formatLocale, "before", 6, 6, {
            cover: false,
        })
    }, [isBalanceVisible, value.value, currencySymbol, formatLocale])

    const percentageChange = useDerivedValue(() => {
        if (!data) return 0
        return ((value.value - (data[0]?.value ?? 0)) / (data[0]?.value ?? 1)) * 100
    }, [value.value, data])

    const formattedPercentageChange = useDerivedValue(() => {
        "worklet"
        return ReanimatedUtils.formatFiatWorklet(percentageChange.value, "%", formatLocale, "after", 2, 2, {
            cover: false,
        })
    }, [isBalanceVisible, percentageChange.value, currencySymbol, formatLocale])

    const isGoingUp = useDerivedValue(() => {
        "worklet"
        return percentageChange.value > 0
    }, [percentageChange.value])

    return (
        <BaseView flexDirection="column" alignItems="flex-end">
            <BaseText
                typographyFont="subTitleSemiBold"
                color={theme.colors.activityCard.title}
                align="right"
                numberOfLines={1}
                flexDirection="row"
                testID="ASSET_DETAIL_SCREEN_FIAT_BALANCE"
                lineHeight={28}>
                {formatted.value}
            </BaseText>
            <BaseView flexDirection="row" gap={2}>
                <BaseIcon
                    name={isGoingUp.value ? "icon-stat-arrow-up" : "icon-stat-arrow-down"}
                    size={16}
                    color={isGoingUp.value ? COLORS.GREEN_300 : COLORS.RED_400}
                    testID="ASSET_DETAIL_SCREEN_CHART_ICON"
                />
                <BaseText
                    typographyFont="bodySemiBold"
                    color={isGoingUp.value ? COLORS.GREEN_300 : COLORS.RED_400}
                    align="right"
                    testID="ASSET_DETAIL_SCREEN_FIAT_BALANCE">
                    {formattedPercentageChange.value}
                </BaseText>
            </BaseView>
        </BaseView>
    )
}
