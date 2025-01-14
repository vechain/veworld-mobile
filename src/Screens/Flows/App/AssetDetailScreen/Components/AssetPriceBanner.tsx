import React, { useMemo } from "react"
import { useAnimatedStyle, useDerivedValue } from "react-native-reanimated"
import { StyleSheet } from "react-native"
import { useThemedStyles } from "~Hooks"

import { BaseAnimatedText, BaseText, BaseView } from "~Components"
import { useI18nContext } from "~i18n"
import { useLineChartDatetime, useLineChartPrice, useLineChartRelativeChange } from "../Hooks/usePrice"
import { typography, ColorThemeType } from "~Constants"
import { AssetTrendBannerSkeleton } from "./AssetTrendBannerSkeleton"
import { AssetPriceBannerSkeleton } from "./AssetPriceBannerSkeleton"
import { isIOS } from "~Utils/PlatformUtils/PlatformUtils"
import { PlatformUtils } from "~Utils"
const { ...otherTypography } = typography

type Props = {
    isChartDataLoading: boolean
}
export const AssetPriceBanner = ({ isChartDataLoading }: Props) => {
    const { LL } = useI18nContext()
    const datetime = useLineChartDatetime(LL.COMMON_OVERALL())
    const { formatted: formattedPrice } = useLineChartPrice()
    const { value: priceChangeValue, formatted: formattedPriceChange } = useLineChartRelativeChange({})

    const { styles, theme } = useThemedStyles(baseStyles)

    const icon = useDerivedValue(() => (priceChangeValue.value > 0 ? "+" : "-"), [priceChangeValue.value])
    const changeStyles = useAnimatedStyle(
        () => ({
            color: priceChangeValue.value > 0 ? theme.colors.success : theme.colors.danger,
        }),
        [priceChangeValue.value, theme.colors.success, theme.colors.danger],
    )

    const responsiveFontSize = useDerivedValue(() => {
        if (formattedPrice.value.length < 10) {
            return 32
        } else {
            return 24
        }
    }, [formattedPrice.value.length])

    const applyPriceContainerStyle = useMemo(() => {
        return isIOS() ? styles.textContainer : undefined
    }, [styles.textContainer])

    return (
        <BaseView flexDirection="row" justifyContent="space-between" w={100}>
            <BaseView style={applyPriceContainerStyle} justifyContent="space-between">
                <BaseText typographyFont="body">{LL.COMMON_PRICE()}</BaseText>
                <BaseView flexDirection="row" alignItems="baseline">
                    {isChartDataLoading ? (
                        <AssetPriceBannerSkeleton />
                    ) : (
                        <BaseAnimatedText
                            text={formattedPrice}
                            style={[
                                styles.textBigTitle,
                                {
                                    fontSize: otherTypography.fontSize[responsiveFontSize.value],
                                },
                            ]}
                        />
                    )}
                </BaseView>
            </BaseView>

            <BaseView alignItems="flex-end" style={styles.textContainer} justifyContent="space-between">
                <BaseAnimatedText text={datetime.formatted} style={{ color: theme.colors.text }} />

                {isChartDataLoading ? (
                    <AssetTrendBannerSkeleton />
                ) : (
                    <BaseView flexDirection="row">
                        <BaseAnimatedText text={icon} style={[changeStyles, styles.textTitle, styles.icon]} />
                        <BaseAnimatedText text={formattedPriceChange} style={[changeStyles, styles.textTitle]} />
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
            color: theme.colors.text,
            fontWeight: "700",
            fontFamily: otherTypography.fontFamily["Inter-Bold"],
        },
        textTitle: {
            fontSize: otherTypography.fontSize[22],
            fontWeight: "700",
            fontFamily: otherTypography.fontFamily["Inter-Bold"],
            padding: 0,
        },
        icon: {
            marginRight: PlatformUtils.isAndroid() ? -8 : undefined,
        },
    })
