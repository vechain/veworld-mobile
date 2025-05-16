import { ethers } from "ethers"
import { default as React, useMemo } from "react"
import { StyleSheet } from "react-native"
import Animated, { LinearTransition } from "react-native-reanimated"
import { getCoinGeckoIdBySymbol, useExchangeRate } from "~Api/Coingecko"
import { BaseText, BaseView } from "~Components/Base"
import { GasPriceCoefficient, VTHO } from "~Constants"
import { useBlinkStyles, useFormatFiat, useThemedStyles } from "~Hooks"
import { TransactionFeesResult } from "~Hooks/useTransactionFees/useTransactionFees"
import { useI18nContext } from "~i18n"
import { selectCurrency, useAppSelector } from "~Storage/Redux"
import { BigNutils } from "~Utils"
import { BaseAnimatedText } from "../BaseAnimatedText"
import { TokenImage } from "../TokenImage"

type Props = {
    options: TransactionFeesResult
    selectedFeeOption: GasPriceCoefficient
    secondsRemaining: number
}

export const GalacticaEstimation = ({ options, selectedFeeOption, secondsRemaining }: Props) => {
    const { LL } = useI18nContext()
    const { theme, styles } = useThemedStyles(baseStyles)

    const currency = useAppSelector(selectCurrency)

    const { formatValue, formatFiat } = useFormatFiat()

    const { data: exchangeRate } = useExchangeRate({
        id: getCoinGeckoIdBySymbol[VTHO.symbol],
        vs_currency: currency,
    })

    const { estimatedFee, maxFee } = useMemo(() => options[selectedFeeOption], [options, selectedFeeOption])

    const estimatedFeeVtho = useMemo(
        () => parseFloat(ethers.utils.formatEther(estimatedFee.toString)),
        [estimatedFee.toString],
    )
    const maxFeeVtho = useMemo(() => parseFloat(ethers.utils.formatEther(maxFee.toString)), [maxFee.toString])

    const estimatedFeeFiat = useMemo(() => {
        return BigNutils().toCurrencyConversion(estimatedFeeVtho.toString() || "0", exchangeRate ?? 1)
    }, [exchangeRate, estimatedFeeVtho])

    const estimatedFormattedFiat = useMemo(() => {
        if (estimatedFeeFiat.isLeesThan_0_01) return formatFiat({ amount: 0.01 })
        return formatFiat({ amount: parseInt(estimatedFeeFiat.preciseValue, 10) })
    }, [estimatedFeeFiat.isLeesThan_0_01, estimatedFeeFiat.preciseValue, formatFiat])

    const blinkStyles = useBlinkStyles({ enabled: secondsRemaining <= 3, duration: 1000 })

    return (
        <Animated.View layout={LinearTransition} style={styles.section}>
            <BaseView flexDirection="row" justifyContent="space-between" w={100}>
                <BaseText color={theme.colors.textLight} typographyFont="captionMedium" numberOfLines={1}>
                    {LL.ESTIMATED_FEE()}
                </BaseText>
                <BaseText color={theme.colors.textLight} typographyFont="captionMedium" numberOfLines={1}>
                    {LL.MAX_FEE()}
                </BaseText>
            </BaseView>
            <BaseView flexDirection="row" justifyContent="space-between" w={100} alignItems="center">
                <BaseView flexDirection="row" gap={8}>
                    <TokenImage icon={VTHO.icon} isVechainToken iconSize={16} />
                    <BaseAnimatedText
                        typographyFont="subSubTitleBold"
                        color={theme.colors.assetDetailsCard.title}
                        style={blinkStyles}>
                        {VTHO.symbol}
                    </BaseAnimatedText>
                    <BaseAnimatedText
                        typographyFont="subSubTitleBold"
                        color={theme.colors.assetDetailsCard.title}
                        style={blinkStyles}
                        testID="GALACTICA_ESTIMATED_FEE">
                        {formatValue(estimatedFeeVtho)}
                    </BaseAnimatedText>
                    <BaseAnimatedText typographyFont="bodyMedium" color={theme.colors.textLight} style={blinkStyles}>
                        {estimatedFeeFiat.isLeesThan_0_01 ? `< ${estimatedFormattedFiat}` : estimatedFormattedFiat}
                    </BaseAnimatedText>
                </BaseView>
                <BaseAnimatedText
                    typographyFont="subSubTitleBold"
                    color={theme.colors.textLight}
                    style={blinkStyles}
                    testID="GALACTICA_MAX_FEE">
                    {formatValue(maxFeeVtho)} {VTHO.symbol}
                </BaseAnimatedText>
            </BaseView>
        </Animated.View>
    )
}

const baseStyles = () => {
    return StyleSheet.create({
        section: {
            padding: 16,
            flexDirection: "column",
            gap: 4,
        },
    })
}
