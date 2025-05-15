import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import { ethers } from "ethers"
import { forwardRef, default as React, useCallback, useMemo, useState } from "react"
import { StyleSheet } from "react-native"
import {
    BaseBottomSheet,
    BaseButton,
    BaseButtonGroupHorizontal,
    BaseIcon,
    BaseSpacer,
    BaseText,
    BaseView,
} from "~Components/Base"
import { ColorThemeType, GasPriceCoefficient, VTHO } from "~Constants"
import { useFormatFiat, useThemedStyles } from "~Hooks"
import { TransactionFeesResult } from "~Hooks/useTransactionFees"
import { useI18nContext } from "~i18n"
import { BaseButtonGroupHorizontalType } from "~Model"
import { SPEED_MAP } from "./constants"

type Props = {
    setSelectedFeeOption: (value: GasPriceCoefficient) => void
    selectedFeeOption: GasPriceCoefficient
    onClose: () => void
    isGalactica?: boolean
    options: TransactionFeesResult
    isBaseFeeRampingUp: boolean
}

export const GasFeeSpeedBottomSheet = forwardRef<BottomSheetModalMethods, Props>(function GasFeeSpeedBottomSheet(
    { setSelectedFeeOption, selectedFeeOption, onClose, isGalactica, options, isBaseFeeRampingUp },
    ref,
) {
    const { LL } = useI18nContext()
    const { theme, styles } = useThemedStyles(baseStyles)
    const { formatValue } = useFormatFiat()
    const [internalFeeOption, setInternalFeeOption] = useState<GasPriceCoefficient>(selectedFeeOption)

    const gasFeeButtons: Array<BaseButtonGroupHorizontalType> = useMemo(() => {
        return [
            {
                id: String(GasPriceCoefficient.REGULAR),
                label: LL.SEND_FEE_SLOW(),
            },
            {
                id: String(GasPriceCoefficient.MEDIUM),
                label: LL.SEND_FEE_NORMAL(),
            },
            {
                id: String(GasPriceCoefficient.HIGH),
                label: LL.SEND_FEE_FAST(),
            },
        ]
    }, [LL])

    const { estimatedFee, maxFee } = useMemo(() => options[internalFeeOption], [internalFeeOption, options])

    const estimatedFeeVtho = useMemo(
        () => parseFloat(ethers.utils.formatEther(estimatedFee.toString)),
        [estimatedFee.toString],
    )
    const maxFeeVtho = useMemo(() => parseFloat(ethers.utils.formatEther(maxFee.toString)), [maxFee.toString])

    const onApply = useCallback(() => {
        setSelectedFeeOption(internalFeeOption)
        onClose()
    }, [internalFeeOption, onClose, setSelectedFeeOption])

    return (
        <BaseBottomSheet ref={ref} dynamicHeight contentStyle={styles.rootContent}>
            <BaseView flexDirection="row" gap={12}>
                <BaseIcon name="icon-thunder" size={20} color={theme.colors.editSpeedBs.title} />
                <BaseText typographyFont="subTitleSemiBold" color={theme.colors.editSpeedBs.title}>
                    {LL.EDIT_SPEED()}
                </BaseText>
            </BaseView>
            <BaseSpacer height={8} />
            <BaseText typographyFont="buttonSecondary" color={theme.colors.editSpeedBs.subtitle}>
                {LL.EDIT_SPEED_DESC()}
            </BaseText>
            <BaseSpacer height={24} />
            <BaseButtonGroupHorizontal
                selectedButtonIds={[String(internalFeeOption)]}
                buttons={gasFeeButtons}
                action={v => setInternalFeeOption(parseInt(v.id, 10) as GasPriceCoefficient)}
                renderButton={(button, textColor) => (
                    <BaseView justifyContent="center" alignItems="center" flexDirection="row">
                        <BaseText color={textColor} typographyFont="smallButtonPrimary">
                            {button.label}
                        </BaseText>
                    </BaseView>
                )}
            />
            <BaseSpacer height={24} />
            <BaseView style={styles.result} gap={8} flexDirection="column">
                <BaseView flexDirection="row" w={100} justifyContent="space-between">
                    <BaseText typographyFont="subSubTitleBold" color={theme.colors.assetDetailsCard.title}>
                        {LL.SEND_ESTIMATED_TIME()}
                    </BaseText>
                    <BaseView flexDirection="row" gap={4} alignItems="center">
                        <BaseText typographyFont="subSubTitleBold" color={theme.colors.assetDetailsCard.title}>
                            {LL.UNDER_SECONDS({ seconds: SPEED_MAP[internalFeeOption].asSeconds() })}
                        </BaseText>
                        <BaseIcon name="icon-timer" size={16} color={theme.colors.textLight} />
                    </BaseView>
                </BaseView>
                {isGalactica ? (
                    <>
                        <BaseView flexDirection="row" w={100} justifyContent="space-between">
                            <BaseText typographyFont="bodyMedium" color={theme.colors.textLight}>
                                {LL.ESTIMATED_FEE()}
                            </BaseText>
                            <BaseText
                                typographyFont="bodyMedium"
                                color={theme.colors.textLight}
                                testID="GALACTICA_ESTIMATED_FEE_BS">
                                {formatValue(estimatedFeeVtho)} {VTHO.symbol}
                            </BaseText>
                        </BaseView>
                        <BaseView flexDirection="row" w={100} justifyContent="space-between">
                            <BaseText typographyFont="bodyMedium" color={theme.colors.textLight}>
                                {LL.MAX_FEE()}
                            </BaseText>
                            <BaseText
                                typographyFont="bodyMedium"
                                color={theme.colors.textLight}
                                testID="GALACTICA_MAX_FEE_BS">
                                {formatValue(maxFeeVtho)} {VTHO.symbol}
                            </BaseText>
                        </BaseView>
                        {isBaseFeeRampingUp && (
                            <BaseView
                                flexDirection="row"
                                w={100}
                                justifyContent="space-between"
                                bg={theme.colors.warningAlert.background}
                                gap={12}>
                                <BaseIcon size={16} color={theme.colors.warningAlert.icon} name="icon-alert-triangle">
                                    {LL.BASE_FEE_RAMPING_UP()}
                                </BaseIcon>
                                <BaseText typographyFont="bodyMedium" color={theme.colors.warningAlert.text}>
                                    {LL.BASE_FEE_RAMPING_UP()}
                                </BaseText>
                            </BaseView>
                        )}
                    </>
                ) : (
                    <BaseView flexDirection="row" w={100} justifyContent="space-between">
                        <BaseText typographyFont="bodyMedium" color={theme.colors.textLight}>
                            {LL.GAS_FEE()}
                        </BaseText>
                        <BaseText
                            typographyFont="bodyMedium"
                            color={theme.colors.textLight}
                            testID="LEGACY_ESTIMATED_FEE_BS">
                            {formatValue(estimatedFeeVtho)} {VTHO.symbol}
                        </BaseText>
                    </BaseView>
                )}
            </BaseView>
            <BaseSpacer height={24} />
            <BaseView gap={16} flexDirection="row" w={100}>
                <BaseButton variant="outline" action={onClose} flex={1} testID="GAS_FEE_BOTTOM_SHEET_CANCEL">
                    {LL.COMMON_BTN_CANCEL()}
                </BaseButton>
                <BaseButton action={onApply} flex={1} testID="GAS_FEE_BOTTOM_SHEET_APPLY">
                    {LL.COMMON_BTN_APPLY()}
                </BaseButton>
            </BaseView>
        </BaseBottomSheet>
    )
})

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        rootContent: {
            paddingBottom: 40,
        },
        result: {
            borderWidth: 1,
            borderColor: theme.colors.editSpeedBs.result.border,
            backgroundColor: theme.colors.editSpeedBs.result.background,
            padding: 24,
            borderRadius: 8,
        },
        alert: {
            backgroundColor: theme.colors.warningAlert.background,
        },
    })
