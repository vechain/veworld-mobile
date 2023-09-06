import React from "react"
import { useAnimatedStyle, useDerivedValue } from "react-native-reanimated"
import { StyleSheet } from "react-native"
import { useThemedStyles } from "~Hooks"

import { BaseText, BaseView } from "~Components"
import { useI18nContext } from "~i18n"
import {
    useLineChartDatetime,
    useLineChartPrice,
    useLineChartRelativeChange,
} from "../Hooks/usePrice"
import { typography, ColorThemeType } from "~Constants"
import { BaseAnimatedText } from "./AnimatedTextInput"
import { selectChartDataIsLoading, useAppSelector } from "~Storage/Redux"
import { AssetTrendBannerSkeleton } from "./AssetTrendBannerSkeleton"
import { AssetPriceBannerSkeleton } from "./AssetPriceBannerSkeleton"
const { ...otherTypography } = typography

export const AssetPriceBanner = ({ symbol }: { symbol: string }) => {
    const { LL } = useI18nContext()
    const chartDataIsLoading = useAppSelector(state =>
        selectChartDataIsLoading(symbol, state),
    )
    const datetime = useLineChartDatetime()
    const { formatted: formattedPrice } = useLineChartPrice()
    const { value: priceChangeValue, formatted: formattedPriceChange } =
        useLineChartRelativeChange({})

    const { styles, theme } = useThemedStyles(baseStyles)

    const icon = useDerivedValue(
        () => (priceChangeValue.value > 0 ? "+" : "-"),
        [priceChangeValue.value],
    )
    const changeStyles = useAnimatedStyle(
        () => ({
            color:
                priceChangeValue.value > 0
                    ? theme.colors.success
                    : theme.colors.danger,
        }),
        [priceChangeValue.value, theme.colors.success, theme.colors.danger],
    )

    const responsiveFontSize = useDerivedValue(() => {
        if (formattedPrice.value.length < 10) {
            return 32
        } else {
            return 24
        }
    })

    return (
        <BaseView flexDirection="row" justifyContent="space-between" w={100}>
            <BaseView
                style={styles.textContainer}
                justifyContent="space-between">
                <BaseText typographyFont="body">{LL.COMMON_PRICE()}</BaseText>
                <BaseView flexDirection="row" alignItems="baseline">
                    {chartDataIsLoading ? (
                        <AssetPriceBannerSkeleton symbol={symbol} />
                    ) : (
                        <BaseAnimatedText
                            text={formattedPrice}
                            style={[
                                styles.textBigTitle,
                                {
                                    fontSize:
                                        otherTypography.fontSize[
                                            responsiveFontSize.value
                                        ],
                                },
                            ]}
                        />
                    )}
                </BaseView>
            </BaseView>

            <BaseView
                alignItems="flex-end"
                style={styles.textContainer}
                justifyContent="space-between">
                <BaseAnimatedText
                    text={datetime.formatted}
                    style={{ color: theme.colors.text }}
                />

                {chartDataIsLoading ? (
                    <AssetTrendBannerSkeleton />
                ) : (
                    <BaseView flexDirection="row">
                        <BaseAnimatedText
                            text={icon}
                            style={[changeStyles, styles.textTitle]}
                        />
                        <BaseAnimatedText
                            text={formattedPriceChange}
                            style={[changeStyles, styles.textTitle]}
                        />
                    </BaseView>
                )}
            </BaseView>
        </BaseView>
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        textContainer: {
            height: 56,
        },
        textBigTitle: {
            color: theme.colors.primary,
            fontWeight: "700",
            fontFamily: otherTypography.fontFamily["Inter-Bold"],
        },
        textTitle: {
            fontSize: otherTypography.fontSize[22],
            fontWeight: "700",
            fontFamily: otherTypography.fontFamily["Inter-Bold"],
        },
    })
