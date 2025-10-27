import React, { useMemo } from "react"
import { useDerivedValue } from "react-native-reanimated"
import { useLineChart } from "react-native-wagmi-charts"
import { BaseIcon, BaseText, BaseView } from "~Components"
import { COLORS, getNumberFormatter } from "~Constants"
import { useFormatFiat, useTheme } from "~Hooks"
import { selectBalanceVisible, selectCurrencySymbol, useAppSelector } from "~Storage/Redux"
import { ReanimatedUtils } from "~Utils"
import ChartUtils from "~Utils/ChartUtils"
import { useLineChartPrice } from "../../AssetDetailScreen/Hooks/usePrice"

export const AssertChartBalance = () => {
    const { value } = useLineChartPrice()
    const { data } = useLineChart()
    const { formatLocale } = useFormatFiat()
    const isBalanceVisible = useAppSelector(selectBalanceVisible)
    const theme = useTheme()
    const currencySymbol = useAppSelector(selectCurrencySymbol)

    const isGoingUp = useMemo(() => ChartUtils.getPriceChange(data) >= 0, [data])
    const percentageChange = useMemo(() => ChartUtils.getPercentagePriceChange(data), [data])

    const formattedPercentageChange = useMemo(
        () =>
            `${getNumberFormatter({
                locale: formatLocale,
                precision: 2,
                style: "decimal",
                useGrouping: true,
            }).format(percentageChange)}%`,
        [formatLocale, percentageChange],
    )

    const formatted = useDerivedValue(() => {
        return ReanimatedUtils.formatFiatWorklet(value.value, currencySymbol, formatLocale, "before", 6, 6, {
            cover: !isBalanceVisible,
        })
    }, [isBalanceVisible, value.value, currencySymbol, formatLocale])

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
                    name={isGoingUp ? "icon-stat-arrow-up" : "icon-stat-arrow-down"}
                    size={16}
                    color={isGoingUp ? COLORS.GREEN_300 : COLORS.RED_400}
                    testID="ASSET_DETAIL_SCREEN_CHART_ICON"
                />
                <BaseText
                    typographyFont="bodySemiBold"
                    color={isGoingUp ? COLORS.GREEN_300 : COLORS.RED_400}
                    align="right"
                    testID="ASSET_DETAIL_SCREEN_FIAT_BALANCE">
                    {formattedPercentageChange}
                </BaseText>
            </BaseView>
        </BaseView>
    )
}
