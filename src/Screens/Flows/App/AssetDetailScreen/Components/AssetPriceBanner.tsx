import React, { useMemo } from "react"
import { useAnimatedStyle, useDerivedValue } from "react-native-reanimated"
import { StyleSheet } from "react-native"
import { useThemedStyles } from "~Hooks"

import { BaseAnimatedText, BaseSpacer, BaseText, BaseView } from "~Components"
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
            color: priceChangeValue.value > 0 ? theme.colors.positive : theme.colors.negative,
        }),
        [priceChangeValue.value, theme.colors.success, theme.colors.danger],
    )

    const applyPriceContainerStyle = useMemo(() => {
        return isIOS() ? styles.textContainer : undefined
    }, [styles.textContainer])

    return (
        <BaseView flexDirection="row" justifyContent="space-between" w={100}>
            <BaseView style={applyPriceContainerStyle} justifyContent="space-between">
                <BaseText color={theme.colors.graphStatsText} style={styles.textCaption}>
                    {LL.COMMON_PRICE()}
                </BaseText>
                <BaseView flexDirection="row" alignItems="baseline">
                    {isChartDataLoading ? (
                        <>
                            <BaseSpacer height={4} />
                            <AssetPriceBannerSkeleton />
                        </>
                    ) : (
                        <BaseAnimatedText
                            text={formattedPrice}
                            style={[styles.textTitle, { color: theme.colors.text }]}
                        />
                    )}
                </BaseView>
            </BaseView>

            <BaseView alignItems="flex-end" style={styles.textContainer} justifyContent="space-between">
                <BaseAnimatedText
                    text={datetime.formatted}
                    style={[styles.textCaption, { color: theme.colors.graphStatsText }]}
                />

                {isChartDataLoading ? (
                    <>
                        <BaseSpacer height={4} />
                        <AssetTrendBannerSkeleton />
                    </>
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
            height: 44,
        },
        textBigTitle: {
            color: theme.colors.text,
            fontWeight: "700",
            fontFamily: otherTypography.fontFamily["Inter-Bold"],
        },
        textTitle: {
            fontSize: otherTypography.fontSize[18],
            fontWeight: "600",
            fontFamily: otherTypography.fontFamily["Inter-SemiBold"],
            height: 28,
            padding: 0,
        },
        textCaption: {
            fontSize: otherTypography.fontSize[12],
            fontWeight: "400",
            fontFamily: otherTypography.fontFamily["Inter-Regular"],
            height: 16,
            padding: 0,
        },
        icon: {
            marginRight: PlatformUtils.isAndroid() ? -8 : undefined,
        },
    })
