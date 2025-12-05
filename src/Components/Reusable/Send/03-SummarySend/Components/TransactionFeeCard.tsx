import React, { useCallback, useEffect, useMemo, useState } from "react"
import { Animated, StyleSheet } from "react-native"
import { RequireUserPassword, useSendContext } from "~Components"
import { BaseIcon, BaseText, BaseView } from "~Components/Base"
import { DelegationView } from "~Components/Reusable/DelegationView"
import { GasFeeSpeed } from "~Components/Reusable/GasFeeSpeed"
import { COLORS, ColorThemeType, VTHO } from "~Constants"
import { useThemedStyles } from "~Hooks"
import { useTransactionScreen } from "~Hooks/useTransactionScreen"
import { useI18nContext } from "~i18n"
import { FungibleTokenWithBalance } from "~Model"
import { BigNutils, TransactionUtils } from "~Utils"
import { useTransactionCallbacks } from "../Hooks"

type TransactionFeeCardProps = {
    token: FungibleTokenWithBalance
    amount: string
    address: string
    onTxFinished?: (success: boolean) => void
    onGasAdjusted: () => void
}

export const TransactionFeeCard = ({
    token,
    amount,
    address,
    onTxFinished,
    onGasAdjusted,
}: TransactionFeeCardProps) => {
    const { LL } = useI18nContext()
    const { styles, theme } = useThemedStyles(baseStyles)
    const { flowState, setFlowState } = useSendContext()
    const [finalAmount, setFinalAmount] = useState(amount)

    const onFailure = useCallback(() => onTxFinished?.(false), [onTxFinished])
    const { onTransactionSuccess, onTransactionFailure } = useTransactionCallbacks({ token, onFailure })

    const clauses = useMemo(
        () => TransactionUtils.prepareFungibleClause(finalAmount, token, address),
        [finalAmount, token, address],
    )

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
        isDelegated,
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
        fallbackToVTHO,
        hasEnoughBalanceOnAny,
        isFirstTimeLoadingFees,
        hasEnoughBalanceOnToken,
    } = useTransactionScreen({
        clauses,
        onTransactionSuccess,
        onTransactionFailure,
        autoVTHOFallback: false,
    })

    /**
     * If user is sending a token and gas is not enough, we will adjust the amount to send or switch fee token.
     */
    useEffect(() => {
        if (isDelegated && selectedDelegationToken === VTHO.symbol) {
            return
        }
        if (isEnoughGas) {
            return
        }
        if (selectedDelegationToken.toLowerCase() !== token.symbol.toLowerCase()) {
            fallbackToVTHO()
            onGasAdjusted()
            return
        }

        const gasFees = gasOptions[selectedFeeOption].maxFee
        const balance = BigNutils(token.balance.balance)
        if (BigNutils(amount).multiply(BigNutils(10).toBN.pow(18)).plus(gasFees.toBN).isBiggerThan(balance.toBN)) {
            const newBalance = balance.minus(gasFees.toBN)
            if (newBalance.isLessThanOrEqual("0")) {
                fallbackToVTHO()
                setFinalAmount(amount)
            } else {
                const adjustedAmount = newBalance.toHuman(token.decimals).decimals(4).toString
                setFinalAmount(adjustedAmount)
                setFlowState({
                    ...flowState,
                    amount: adjustedAmount,
                    amountInFiat: false,
                })
            }

            onGasAdjusted()
        }
    }, [
        amount,
        fallbackToVTHO,
        gasOptions,
        isDelegated,
        isEnoughGas,
        selectedDelegationToken,
        selectedFeeOption,
        token.balance.balance,
        token.decimals,
        token.symbol,
        onGasAdjusted,
        flowState,
        setFlowState,
    ])

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
