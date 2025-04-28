import { ethers } from "ethers"
import React, { useEffect, useMemo } from "react"
import { StyleSheet } from "react-native"
import { useCountdown } from "usehooks-ts"
import { useExchangeRate } from "~Api/Coingecko"
import { BaseButton, BaseCard, BaseIcon, BaseSpacer, BaseText, BaseView } from "~Components/Base"
import { ColorThemeType, GasPriceCoefficient, getCoinGeckoIdBySymbol, VTHO } from "~Constants"
import { useBottomSheetModal, useFormatFiat, useThemedStyles } from "~Hooks"
import { TransactionFeesResult } from "~Hooks/useTransactionFees/useTransactionFees"
import { useI18nContext } from "~i18n"
import { selectCurrency, useAppSelector } from "~Storage/Redux"
import { BigNutils } from "~Utils"
import { TokenImage } from "../TokenImage"
import { SPEED_MAP } from "./constants"
import { GasFeeSpeedBottomSheet } from "./GasFeeSpeedBottomSheet"

type Props = {
    options: TransactionFeesResult
    setSelectedFeeOption: (value: GasPriceCoefficient) => void
    selectedFeeOption: GasPriceCoefficient
    onRefreshFee: () => void
}

export const GasFeeSpeed = ({ options, setSelectedFeeOption, selectedFeeOption, onRefreshFee }: Props) => {
    const { LL } = useI18nContext()
    const { theme, styles } = useThemedStyles(baseStyles)

    const { formatValue, formatFiat } = useFormatFiat()

    const { onClose, onOpen, ref } = useBottomSheetModal()

    const currency = useAppSelector(selectCurrency)

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

    const [secondsRemaining, { startCountdown }] = useCountdown({ intervalMs: 1000, countStart: 10 })

    useEffect(() => {
        startCountdown()
    }, [startCountdown])

    useEffect(() => {
        if (secondsRemaining === 0) onRefreshFee()
    }, [onRefreshFee, secondsRemaining])

    return (
        <BaseView flexDirection="column" gap={16} mt={16}>
            <BaseView w={100} justifyContent="space-between" alignItems="center" flexDirection="row">
                <BaseText typographyFont="subSubTitleBold" color={theme.colors.primary}>
                    {LL.TRANSACTION_FEE()}
                </BaseText>
                <BaseView flexDirection="row" gap={4} alignItems="center">
                    <BaseText typographyFont="bodyMedium" color={theme.colors.textLight} lineHeight={20}>
                        {LL.UPDATING_IN()}
                    </BaseText>
                    <BaseText typographyFont="bodySemiBold" color={theme.colors.textLight} lineHeight={20}>
                        {LL.ONLY_SECONDS({ seconds: secondsRemaining })}
                    </BaseText>
                </BaseView>
            </BaseView>
            <BaseCard containerStyle={styles.cardContainer} style={styles.card}>
                <BaseView flexDirection="row" gap={12} justifyContent="space-between" w={100} style={styles.section}>
                    <BaseView flexDirection="column" gap={4}>
                        <BaseText color={theme.colors.textLight} typographyFont="captionMedium">
                            {LL.SEND_ESTIMATED_TIME()}
                        </BaseText>
                        <BaseView flexDirection="row" gap={8}>
                            <BaseIcon name="icon-timer" size={16} color={theme.colors.textLight} />
                            <BaseText typographyFont="subSubTitleBold" color={theme.colors.assetDetailsCard.title}>
                                {LL.UNDER_SECONDS({ seconds: SPEED_MAP[selectedFeeOption].asSeconds() })}
                            </BaseText>
                        </BaseView>
                    </BaseView>
                    <BaseButton
                        leftIcon={<BaseIcon name="icon-thunder" color={theme.colors.primary} size={16} px={0} py={0} />}
                        action={onOpen}
                        variant="solid"
                        bgColor={theme.colors.cardButton.background}
                        style={styles.cardButton}
                        px={12}
                        py={8}
                        textColor={theme.colors.cardButton.text}>
                        {LL.EDIT_SPEED()}
                    </BaseButton>
                </BaseView>
                <BaseSpacer height={1} background={theme.colors.pressableCardBorder} />
                <BaseView flexDirection="column" style={styles.section} gap={4}>
                    <BaseView flexDirection="row" justifyContent="space-between" w={100}>
                        <BaseText color={theme.colors.textLight} typographyFont="captionMedium">
                            {LL.ESTIMATED_FEE()}
                        </BaseText>
                        <BaseText color={theme.colors.textLight} typographyFont="captionMedium">
                            {LL.MAX_FEE()}
                        </BaseText>
                    </BaseView>
                    <BaseView flexDirection="row" justifyContent="space-between" w={100} alignItems="center">
                        <BaseView flexDirection="row" gap={8}>
                            <TokenImage icon={VTHO.icon} isVechainToken iconSize={16} />
                            <BaseText typographyFont="subSubTitleBold" color={theme.colors.assetDetailsCard.title}>
                                {VTHO.symbol}
                            </BaseText>
                            <BaseText typographyFont="subSubTitleBold" color={theme.colors.assetDetailsCard.title}>
                                {formatValue(estimatedFeeVtho)}
                            </BaseText>
                            <BaseText typographyFont="bodyMedium" color={theme.colors.textLight}>
                                {estimatedFeeFiat.isLeesThan_0_01
                                    ? `< ${estimatedFormattedFiat}`
                                    : estimatedFormattedFiat}
                            </BaseText>
                        </BaseView>
                        <BaseText typographyFont="subSubTitleBold" color={theme.colors.textLight}>
                            {formatValue(maxFeeVtho)} {VTHO.symbol}
                        </BaseText>
                    </BaseView>
                </BaseView>
                <GasFeeSpeedBottomSheet
                    ref={ref}
                    estimatedFee={estimatedFee}
                    maxFee={maxFee}
                    selectedFeeOption={selectedFeeOption}
                    setSelectedFeeOption={setSelectedFeeOption}
                    onClose={onClose}
                />
            </BaseCard>
        </BaseView>
    )
}

const baseStyles = (theme: ColorThemeType) => {
    return StyleSheet.create({
        section: {
            padding: 16,
        },
        cardContainer: {
            backgroundColor: theme.colors.assetDetailsCard.background,
        },
        card: {
            flexDirection: "column",
            padding: 0,
        },
        cardButton: {
            borderColor: theme.colors.cardButton.border,
            borderWidth: 1,
            backgroundColor: theme.colors.cardButton.background,
            gap: 8,
        },
    })
}
