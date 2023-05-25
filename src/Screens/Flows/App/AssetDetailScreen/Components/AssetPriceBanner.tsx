import React, { useMemo } from "react"
import { useAnimatedStyle, useDerivedValue } from "react-native-reanimated"
import { StyleSheet } from "react-native"
import { ColorThemeType, useThemedStyles } from "~Common"
import { FormattingUtils } from "~Utils"
import { BaseText, BaseView } from "~Components"
import { useI18nContext } from "~i18n"
import {
    useLineChartDatetime,
    useLineChartPrice,
    useLineChartRelativeChange,
} from "../Hooks/usePrice"

import { typography } from "~Common/Theme"
import { TokenWithCompleteInfo } from "~Model"
import { selectCurrencySymbol, useAppSelector } from "~Storage/Redux"
import { BaseAnimatedText } from "./AnimatedTextInput"
const { ...otherTypography } = typography

export const AssetPriceBanner = ({
    token,
}: {
    token?: TokenWithCompleteInfo
}) => {
    const { LL } = useI18nContext()
    const currency = useAppSelector(selectCurrencySymbol)
    const datetime = useLineChartDatetime()
    const { formatted: formattedPrice } = useLineChartPrice()
    const { value: priceChangeValue, formatted: formattedPriceChange } =
        useLineChartRelativeChange({})

    const { styles, theme } = useThemedStyles(baseStyles)

    const isPositive24hChange = useMemo(
        () => (token?.change || 0) > 0,
        [token?.change],
    )

    const change24h = useMemo(
        () =>
            (isPositive24hChange ? "+" : "") +
            FormattingUtils.humanNumber(token?.change || 0) +
            "%",
        [isPositive24hChange, token?.change],
    )

    const icon = useDerivedValue(() => (priceChangeValue.value > 0 ? "+" : "-"))
    const changeStyles = useAnimatedStyle(() => ({
        color:
            priceChangeValue.value > 0
                ? theme.colors.success
                : theme.colors.danger,
    }))

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
                    {token ? (
                        <>
                            <BaseText typographyFont="largeTitle">
                                {currency}
                            </BaseText>
                            <BaseText typographyFont="largeTitle">
                                {token.rate?.toFixed(5)}
                            </BaseText>
                        </>
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

                <BaseView flexDirection="row">
                    {token ? (
                        <>
                            <BaseText
                                typographyFont="title"
                                color={
                                    isPositive24hChange
                                        ? theme.colors.success
                                        : theme.colors.danger
                                }>
                                {change24h}
                            </BaseText>
                        </>
                    ) : (
                        <>
                            <BaseAnimatedText
                                text={icon}
                                style={[changeStyles, styles.textTitle]}
                            />
                            <BaseAnimatedText
                                text={formattedPriceChange}
                                style={[changeStyles, styles.textTitle]}
                            />
                        </>
                    )}
                </BaseView>
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
