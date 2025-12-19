import React from "react"
import { Animated, StyleSheet } from "react-native"
import { RequireUserPassword } from "~Components"
import { BaseIcon, BaseText, BaseView } from "~Components/Base"
import { DelegationView } from "~Components/Reusable/DelegationView"
import { GasFeeSpeed } from "~Components/Reusable/GasFeeSpeed"
import { COLORS, ColorThemeType } from "~Constants"
import { useThemedStyles } from "~Hooks"
import { useI18nContext } from "~i18n"
import { useTokenSendContext } from "../../Provider"
import { useTransactionContext } from "./TransactionProvider"

export const TransactionFeeCard = () => {
    const { LL } = useI18nContext()
    const { styles, theme } = useThemedStyles(baseStyles)
    const { flowState } = useTokenSendContext()
    const token = flowState.token

    const {
        selectedDelegationOption,
        isPasswordPromptOpen,
        handleClosePasswordModal,
        onPasswordSuccess,
        setSelectedFeeOption,
        resetDelegation,
        setSelectedDelegationAccount,
        setSelectedDelegationUrl,
        isEnoughGas,
        selectedDelegationAccount,
        selectedDelegationUrl,
        gasOptions,
        gasUpdatedAt,
        selectedFeeOption,
        isGalactica,
        isBaseFeeRampingUp,
        speedChangeEnabled,
        availableTokens,
        selectedDelegationToken,
        setSelectedDelegationToken,
        hasEnoughBalanceOnAny,
        isFirstTimeLoadingFees,
        hasEnoughBalanceOnToken,
    } = useTransactionContext()

    return (
        <Animated.View>
            <BaseView flexDirection="row" justifyContent="flex-start" alignItems="center" gap={12} py={16}>
                <BaseView style={[styles.iconContainer]}>
                    <BaseIcon color={theme.colors.defaultIcon.color} name="icon-arrow-up-down" size={16} />
                </BaseView>
                <BaseText typographyFont="bodyMedium" color={theme.isDark ? COLORS.GREY_100 : COLORS.GREY_700}>
                    {LL.TRANSACTION_FEE()}
                </BaseText>
            </BaseView>
            <GasFeeSpeed
                gasUpdatedAt={gasUpdatedAt}
                options={gasOptions}
                selectedFeeOption={selectedFeeOption}
                setSelectedFeeOption={setSelectedFeeOption}
                isGalactica={isGalactica}
                isBaseFeeRampingUp={isBaseFeeRampingUp}
                speedChangeEnabled={speedChangeEnabled}
                isEnoughBalance={isEnoughGas}
                availableDelegationTokens={availableTokens}
                delegationToken={selectedDelegationToken}
                setDelegationToken={setSelectedDelegationToken}
                hasEnoughBalanceOnAny={hasEnoughBalanceOnAny}
                isFirstTimeLoadingFees={isFirstTimeLoadingFees}
                hasEnoughBalanceOnToken={hasEnoughBalanceOnToken}
                sendingTokenSymbol={token?.symbol}
                containerStyle={styles.gasFeeSpeedContainer}>
                <DelegationView
                    setNoDelegation={resetDelegation}
                    selectedDelegationOption={selectedDelegationOption}
                    setSelectedDelegationAccount={setSelectedDelegationAccount}
                    selectedDelegationAccount={selectedDelegationAccount}
                    selectedDelegationUrl={selectedDelegationUrl}
                    setSelectedDelegationUrl={setSelectedDelegationUrl}
                    delegationToken={selectedDelegationToken}
                />
            </GasFeeSpeed>

            <RequireUserPassword
                isOpen={isPasswordPromptOpen}
                onClose={handleClosePasswordModal}
                onSuccess={onPasswordSuccess}
            />
        </Animated.View>
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        gasFeeSpeedContainer: {
            marginTop: 0,
        },
        scrollView: {
            flex: 1,
            paddingHorizontal: 24,
        },
        iconContainer: {
            borderColor: theme.colors.defaultIcon.border,
            borderWidth: 1,
            backgroundColor: theme.colors.defaultIcon.background,
            color: theme.colors.defaultIcon.color,
            padding: 8,
            borderRadius: 16,
            width: 32,
            height: 32,
        },
    })
