import React, { useMemo } from "react"
import { useAnimatedStyle, useDerivedValue, useSharedValue } from "react-native-reanimated"
import { StyleSheet } from "react-native"
import { useFormatFiat, useThemedStyles } from "~Hooks"

import { BaseAnimatedText, BaseSpacer, BaseText, BaseView } from "~Components"
import { useI18nContext } from "~i18n"
import { useLineChartDatetime, useLineChartPrice, useLineChartRelativeChange } from "../Hooks/usePrice"
import { ColorThemeType, B3TR } from "~Constants"
import { typography } from "~Constants/Theme"
import { AssetTrendBannerSkeleton } from "./AssetTrendBannerSkeleton"
import { AssetPriceBannerSkeleton } from "./AssetPriceBannerSkeleton"
import { isIOS } from "~Utils/PlatformUtils/PlatformUtils"
import { PlatformUtils } from "~Utils"
import { TokenWithCompleteInfo } from "~Model"
import { selectCurrency, useAppSelector } from "~Storage/Redux"
import { getCoinGeckoIdBySymbol, useExchangeRate } from "~Api/Coingecko"
const { ...otherTypography } = typography

type Props = {
    token: TokenWithCompleteInfo
    isChartDataLoading: boolean
}
export const AssetPriceBanner = ({ token, isChartDataLoading }: Props) => {
    const { LL } = useI18nContext()
    const datetime = useLineChartDatetime(LL.COMMON_OVERALL())
    const { formatted: formattedPrice } = useLineChartPrice()
    const { value: priceChangeValue, formatted: formattedPriceChange } = useLineChartRelativeChange({})

    //TODO: remove from here to line 36 this when revert to coingecko's service to get fiat price
    const currency = useAppSelector(selectCurrency)
    const { data: exchangeRate } = useExchangeRate({
        id: getCoinGeckoIdBySymbol[token.symbol],
        vs_currency: currency,
    })
    const { formatFiat } = useFormatFiat({ maximumFractionDigits: 5, minimumFractionDigits: 5 })
    const change = useSharedValue(formatFiat({ amount: exchangeRate }) ?? "0")

    const { styles, theme } = useThemedStyles(baseStyles)

    const icon = useDerivedValue(() => (priceChangeValue.value > 0 ? "+" : "-"), [priceChangeValue.value])
    const changeStyles = useAnimatedStyle(
        () => ({
            color: priceChangeValue.value > 0 ? theme.colors.positive : theme.colors.negative,
        }),
        [priceChangeValue.value, theme.colors.positive, theme.colors.negative],
    )

    const applyPriceContainerStyle = useMemo(() => {
        return isIOS() ? styles.textContainer : undefined
    }, [styles.textContainer])

    return (
        <BaseView flexDirection="row" justifyContent="space-between" w={100}>
            <BaseView style={applyPriceContainerStyle} justifyContent="space-between">
                <BaseText color={theme.colors.graphStatsText} style={styles.textBody}>
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
                            text={token.symbol === B3TR.symbol ? change : formattedPrice}
                            style={[styles.textTitle, { color: theme.colors.text }]}
                        />
                    )}
                </BaseView>
            </BaseView>
            {token.symbol !== B3TR.symbol && (
                <BaseView alignItems="flex-end" style={styles.textContainer} justifyContent="space-between">
                    <BaseAnimatedText
                        text={datetime.formatted}
                        style={[styles.textBody, { color: theme.colors.graphStatsText }]}
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
            )}
        </BaseView>
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        textContainer: {
            height: 44,
            gap: 3,
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
        textBody: {
            fontSize: otherTypography.fontSize[14],
            fontWeight: "400",
            fontFamily: otherTypography.fontFamily["Inter-Regular"],
            height: 16,
            padding: 0,
        },
        icon: {
            marginRight: PlatformUtils.isAndroid() ? -8 : undefined,
        },
    })
