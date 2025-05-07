import moment from "moment"
import React, { PropsWithChildren, useCallback, useMemo, useState } from "react"
import { StyleSheet } from "react-native"
import { useInterval } from "usehooks-ts"
import { BaseButton, BaseCard, BaseIcon, BaseSpacer, BaseText, BaseView } from "~Components/Base"
import { ColorThemeType, GasPriceCoefficient } from "~Constants"
import { useBottomSheetModal, useThemedStyles } from "~Hooks"
import { TransactionFeesResult } from "~Hooks/useTransactionFees/useTransactionFees"
import { useI18nContext } from "~i18n"
import { SPEED_MAP } from "./constants"
import { GalacticaEstimation } from "./GalacticaEstimation"
import { GasFeeSpeedBottomSheet } from "./GasFeeSpeedBottomSheet"
import { LegacyEstimation } from "./LegacyEstimation"

type Props = {
    options: TransactionFeesResult
    setSelectedFeeOption: (value: GasPriceCoefficient) => void
    selectedFeeOption: GasPriceCoefficient
    onRefreshFee: () => void
    gasUpdatedAt: number
    isGalactica?: boolean
}

export const GasFeeSpeed = ({
    options,
    setSelectedFeeOption,
    selectedFeeOption,
    gasUpdatedAt,
    isGalactica,
    children,
}: PropsWithChildren<Props>) => {
    const { LL } = useI18nContext()
    const { theme, styles } = useThemedStyles(baseStyles)

    const { onClose, onOpen, ref } = useBottomSheetModal()

    const [secondsRemaining, setSecondsRemaining] = useState(10)

    const { estimatedFee, maxFee } = useMemo(() => options[selectedFeeOption], [options, selectedFeeOption])

    const intervalFn = useCallback(() => {
        setSecondsRemaining(Math.floor(moment(gasUpdatedAt).add(10, "seconds").diff(moment(), "seconds")))
    }, [gasUpdatedAt])

    useInterval(intervalFn, 500)

    return (
        <BaseView flexDirection="column" gap={16} mt={16}>
            <BaseView
                w={100}
                justifyContent={isGalactica ? "space-between" : "flex-start"}
                alignItems="center"
                flexDirection="row">
                <BaseText typographyFont="subSubTitleBold" color={theme.colors.primary}>
                    {LL.TRANSACTION_FEE()}
                </BaseText>
                {secondsRemaining <= 3 && isGalactica && (
                    <BaseView flexDirection="row" gap={4} alignItems="center">
                        <BaseText typographyFont="bodyMedium" color={theme.colors.textLight} lineHeight={20}>
                            {LL.UPDATING_IN()}
                        </BaseText>
                        <BaseText typographyFont="bodySemiBold" color={theme.colors.textLight} lineHeight={20}>
                            {LL.ONLY_SECONDS({ seconds: secondsRemaining })}
                        </BaseText>
                    </BaseView>
                )}
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
                {isGalactica ? (
                    <GalacticaEstimation
                        options={options}
                        selectedFeeOption={selectedFeeOption}
                        secondsRemaining={secondsRemaining}
                    />
                ) : (
                    <LegacyEstimation options={options} selectedFeeOption={selectedFeeOption} />
                )}
                {children}
                <GasFeeSpeedBottomSheet
                    ref={ref}
                    estimatedFee={estimatedFee}
                    maxFee={maxFee}
                    selectedFeeOption={selectedFeeOption}
                    setSelectedFeeOption={setSelectedFeeOption}
                    onClose={onClose}
                    isGalactica={isGalactica}
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
