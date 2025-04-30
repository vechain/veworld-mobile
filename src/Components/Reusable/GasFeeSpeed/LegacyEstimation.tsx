import { ethers } from "ethers"
import { default as React, useMemo } from "react"
import { StyleSheet } from "react-native"
import { getCoinGeckoIdBySymbol, useExchangeRate } from "~Api/Coingecko"
import { BaseText, BaseView } from "~Components/Base"
import { GasPriceCoefficient, VTHO } from "~Constants"
import { useFormatFiat, useThemedStyles } from "~Hooks"
import { TransactionFeesResult } from "~Hooks/useTransactionFees/useTransactionFees"
import { useI18nContext } from "~i18n"
import { selectCurrency, useAppSelector } from "~Storage/Redux"
import { BigNutils } from "~Utils"
import { TokenImage } from "../TokenImage"

type Props = {
    options: TransactionFeesResult
    selectedFeeOption: GasPriceCoefficient
}

export const LegacyEstimation = ({ options, selectedFeeOption }: Props) => {
    const { LL } = useI18nContext()
    const { theme, styles } = useThemedStyles(baseStyles)

    const currency = useAppSelector(selectCurrency)

    const { formatValue, formatFiat } = useFormatFiat()

    const { data: exchangeRate } = useExchangeRate({
        id: getCoinGeckoIdBySymbol[VTHO.symbol],
        vs_currency: currency,
    })

    const { estimatedFee } = useMemo(() => options[selectedFeeOption], [options, selectedFeeOption])

    const estimatedFeeVtho = useMemo(
        () => parseFloat(ethers.utils.formatEther(estimatedFee.toString)),
        [estimatedFee.toString],
    )

    const estimatedFeeFiat = useMemo(() => {
        return BigNutils().toCurrencyConversion(estimatedFeeVtho.toString() || "0", exchangeRate ?? 1)
    }, [exchangeRate, estimatedFeeVtho])

    const estimatedFormattedFiat = useMemo(() => {
        if (estimatedFeeFiat.isLeesThan_0_01) return formatFiat({ amount: 0.01 })
        return formatFiat({ amount: parseInt(estimatedFeeFiat.preciseValue, 10) })
    }, [estimatedFeeFiat.isLeesThan_0_01, estimatedFeeFiat.preciseValue, formatFiat])

    return (
        <BaseView flexDirection="column" style={styles.section} gap={4}>
            <BaseText color={theme.colors.textLight} typographyFont="captionMedium">
                {LL.GAS_FEE()}
            </BaseText>
            <BaseView flexDirection="row" gap={8}>
                <TokenImage icon={VTHO.icon} isVechainToken iconSize={16} />
                <BaseText typographyFont="subSubTitleBold" color={theme.colors.assetDetailsCard.title}>
                    {VTHO.symbol}
                </BaseText>
                <BaseText typographyFont="subSubTitleBold" color={theme.colors.assetDetailsCard.title}>
                    {formatValue(estimatedFeeVtho)}
                </BaseText>
                <BaseText typographyFont="bodyMedium" color={theme.colors.textLight}>
                    {estimatedFeeFiat.isLeesThan_0_01 ? `< ${estimatedFormattedFiat}` : estimatedFormattedFiat}
                </BaseText>
            </BaseView>
        </BaseView>
    )
}

const baseStyles = () => {
    return StyleSheet.create({
        section: {
            padding: 16,
        },
    })
}
