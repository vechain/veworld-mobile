import React, { useCallback, useEffect, useMemo, useState } from "react"
import { Animated, StyleSheet } from "react-native"
import { Transaction } from "@vechain/sdk-core"
import {
    addPendingTransferTransactionActivity,
    selectSelectedNetwork,
    setIsAppLoading,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"
import { BigNutils, error, TransactionUtils } from "~Utils"
import { AnalyticsEvent, COLORS, ColorThemeType, ERROR_EVENTS, VET, VTHO, creteAnalyticsEvent } from "~Constants"
import { BaseText, BaseView, BaseIcon } from "~Components/Base"
import { RequireUserPassword } from "~Components"
import { useTransactionScreen } from "~Hooks/useTransactionScreen"
import { useI18nContext } from "~i18n"
import { useAnalyticTracking, useThemedStyles } from "~Hooks"
import { GasFeeSpeed } from "~Components/Reusable/GasFeeSpeed"
import { DelegationView } from "~Components/Reusable/DelegationView"
import { FungibleTokenWithBalance } from "~Model"

type TransactionFeeCardProps = {
    token: FungibleTokenWithBalance
    amount: string
    address: string
    onTxFinished?: (success: boolean) => void
    onBindTransactionControls?: (controls: { onSubmit: () => void; isDisabledButtonState: boolean }) => void
    onGasAdjusted?: () => void
}

export const TransactionFeeCard = ({
    token,
    amount,
    address,
    onTxFinished,
    onBindTransactionControls,
    onGasAdjusted,
}: TransactionFeeCardProps) => {
    const { LL } = useI18nContext()
    const dispatch = useAppDispatch()
    const track = useAnalyticTracking()
    const network = useAppSelector(selectSelectedNetwork)
    const { styles, theme } = useThemedStyles(baseStyles)
    const [finalAmount, setFinalAmount] = useState(amount)

    const onFinish = useCallback(
        (success: boolean) => {
            const isNative =
                token.symbol.toUpperCase() === VET.symbol.toUpperCase() ||
                token.symbol.toUpperCase() === VTHO.symbol.toUpperCase()

            if (success) {
                track(AnalyticsEvent.WALLET_OPERATION, {
                    ...creteAnalyticsEvent({
                        medium: AnalyticsEvent.SEND,
                        signature: AnalyticsEvent.LOCAL,
                        network: network.name,
                        subject: isNative ? AnalyticsEvent.NATIVE_TOKEN : AnalyticsEvent.TOKEN,
                        context: AnalyticsEvent.SEND,
                    }),
                })
            }

            dispatch(setIsAppLoading(false))
            onTxFinished?.(success)
        },
        [token.symbol, dispatch, track, network.name, onTxFinished],
    )

    const onTransactionSuccess = useCallback(
        async (transaction: Transaction) => {
            try {
                dispatch(addPendingTransferTransactionActivity(transaction))
                dispatch(setIsAppLoading(false))
                onFinish(true)
            } catch (e) {
                error(ERROR_EVENTS.SEND, e)
                onFinish(false)
            }
        },
        [dispatch, onFinish],
    )

    const onTransactionFailure = useCallback(() => {
        onFinish(false)
    }, [onFinish])

    const clauses = useMemo(
        () => TransactionUtils.prepareFungibleClause(finalAmount, token, address),
        [finalAmount, token, address],
    )

    const {
        selectedDelegationOption,
        onSubmit,
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
        isDisabledButtonState,
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

    const [hasReportedGasAdjustment, setHasReportedGasAdjustment] = useState(false)

    useEffect(() => {
        if (!onBindTransactionControls) return

        onBindTransactionControls({
            onSubmit,
            isDisabledButtonState,
        })
    }, [onBindTransactionControls, onSubmit, isDisabledButtonState])

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
            if (!hasReportedGasAdjustment && typeof onGasAdjusted === "function") {
                onGasAdjusted()
                setHasReportedGasAdjustment(true)
            }
            return
        }

        const gasFees = gasOptions[selectedFeeOption].maxFee
        const balance = BigNutils(token.balance.balance)
        if (BigNutils(amount).multiply(BigNutils(10).toBN.pow(18)).plus(gasFees.toBN).isBiggerThan(balance.toBN)) {
            const newBalance = balance.minus(gasFees.toBN)
            if (newBalance.isLessThanOrEqual("0")) {
                fallbackToVTHO()
                setFinalAmount(amount)
            } else setFinalAmount(newBalance.toHuman(token.decimals).decimals(4).toString)

            if (!hasReportedGasAdjustment && typeof onGasAdjusted === "function") {
                onGasAdjusted()
                setHasReportedGasAdjustment(true)
            }
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
        hasReportedGasAdjustment,
        onGasAdjusted,
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
