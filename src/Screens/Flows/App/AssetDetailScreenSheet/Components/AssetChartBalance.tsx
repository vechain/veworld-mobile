import React, { useMemo } from "react"
import { BaseIcon, BaseText, BaseView } from "~Components"
import { useLineChart } from "~Components/Reusable/LineChart"
import { COLORS } from "~Constants"
import { useFormatFiat, useTheme } from "~Hooks"
import { selectCurrencySymbol, useAppSelector } from "~Storage/Redux"
import { formatFiatAmount } from "~Utils/StandardizedFormatting"

export const AssertChartBalance = () => {
    const { data, selectedPoint } = useLineChart()
    const { formatLocale } = useFormatFiat()
    const theme = useTheme()
    const currencySymbol = useAppSelector(selectCurrencySymbol)

    const formatted = useMemo(() => {
        const value = selectedPoint?.value || data[data.length - 1]?.value || 0
        return formatFiatAmount(value, currencySymbol, {
            locale: formatLocale,
            symbolPosition: "before",
            forceDecimals: 6,
        })
    }, [selectedPoint?.value, data, currencySymbol, formatLocale])

    const percentageChange = useMemo(() => {
        if (!data) return 0

        if (!selectedPoint)
            return ((data[data.length - 1]?.value - (data[0]?.value ?? 0)) / (data[0]?.value ?? 1)) * 100

        return ((selectedPoint.value - (data[0]?.value ?? 0)) / (data[0]?.value ?? 1)) * 100
    }, [selectedPoint, data])

    const formattedPercentageChange = useMemo(() => {
        return formatFiatAmount(percentageChange, "%", {
            locale: formatLocale,
            symbolPosition: "after",
            forceDecimals: 2,
        })
    }, [percentageChange, formatLocale])

    const isGoingUp = useMemo(() => {
        return percentageChange > 0
    }, [percentageChange])

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
                {formatted}
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
