import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { StyleSheet } from "react-native"
import Animated from "react-native-reanimated"
import { BaseView } from "~Components"
import { useTokenSendContext } from "~Components/Reusable/Send"
import { VTHO } from "~Constants"
import { useThemedStyles, useTransactionScreen } from "~Hooks"
import { useI18nContext } from "~i18n"
import { BigNutils, TransactionUtils } from "~Utils"
import { SendContent } from "../Shared"
import { TransactionAlert } from "./Components"
import { TokenReceiverCard } from "./Components/TokenReceiverCard"
import { TransactionFeeCard } from "./Components/TransactionFeeCard"
import { TransactionProvider } from "./Components/TransactionProvider"
import { useTransactionCallbacks } from "./Hooks"

export const SummaryScreen = () => {
    const { LL } = useI18nContext()
    const { styles } = useThemedStyles(baseStyles)
    const { flowState, setFlowState } = useTokenSendContext()
    const [txError, setTxError] = useState(false)
    const originalAmount = useRef(flowState.amount)

    const { address } = flowState

    const token = useMemo(() => {
        if (!flowState.token) throw new Error("SummaryScreen requires a token in flowState")
        return flowState.token
    }, [flowState.token])

    const [hasGasAdjustment, setHasGasAdjustment] = useState(false)

    const onFailure = useCallback(() => setTxError(true), [setTxError])
    const { onTransactionSuccess, onTransactionFailure } = useTransactionCallbacks({
        token: token,
        onFailure,
    })

    const clauses = useMemo(
        () => TransactionUtils.prepareFungibleClause(flowState.amount!, token, address!),
        [flowState.amount, token, address],
    )

    const {
        isEnoughGas,
        isDelegated,
        gasOptions,
        selectedFeeOption,
        selectedDelegationToken,
        fallbackToVTHO,
        isDisabledButtonState,
        onSubmit,
        ...transactionProps
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
        // If there's not enough gas with the current delegation token and it's different from the current token that's being sent
        // Then fallback to VTHO
        if (selectedDelegationToken.toLowerCase() !== token.symbol.toLowerCase()) {
            fallbackToVTHO()
            return
        }

        const gasFees = gasOptions[selectedFeeOption].maxFee
        const balance = BigNutils(token.balance.balance)
        const amountPlusFees = BigNutils(flowState.amount!).multiply(BigNutils(10).toBN.pow(18)).plus(gasFees.toBN)
        // If the current amount + fees is < balance, then ignore
        if (amountPlusFees.isLessThanOrEqual(balance.toBN)) return
        const newBalance = balance.minus(gasFees.toBN)
        if (newBalance.isLessThanOrEqual("0")) {
            // If it cannot even pay for the fees, fallback to VTHO and restore the original amount
            fallbackToVTHO()
            setFlowState(prev => ({
                ...prev,
                amount: originalAmount.current,
            }))
        } else {
            // Deduct from the balance the fees to get the new value
            const adjustedAmount = newBalance.toHuman(token.decimals).decimals(4).toString
            setFlowState(prev => ({
                ...prev,
                amount: adjustedAmount,
                amountInFiat: false,
            }))
        }

        setHasGasAdjustment(true)
    }, [
        fallbackToVTHO,
        gasOptions,
        isDelegated,
        isEnoughGas,
        selectedDelegationToken,
        selectedFeeOption,
        token.balance.balance,
        token.decimals,
        token.symbol,
        setFlowState,
        flowState.amount,
    ])

    if (!token || !address) {
        return <BaseView flex={1} />
    }

    return (
        <SendContent>
            <SendContent.Header />
            <SendContent.Container>
                <Animated.View style={styles.root}>
                    <TokenReceiverCard />
                    <TransactionProvider
                        fallbackToVTHO={fallbackToVTHO}
                        isEnoughGas={isEnoughGas}
                        isDelegated={isDelegated}
                        gasOptions={gasOptions}
                        selectedFeeOption={selectedFeeOption}
                        selectedDelegationToken={selectedDelegationToken}
                        isDisabledButtonState={isDisabledButtonState}
                        onSubmit={onSubmit}
                        {...transactionProps}>
                        <TransactionFeeCard />
                    </TransactionProvider>

                    <TransactionAlert hasGasAdjustment={hasGasAdjustment} txError={txError} />
                </Animated.View>
            </SendContent.Container>
            <SendContent.Footer>
                <SendContent.Footer.Back />
                <SendContent.Footer.Next
                    testID="SummaryScreen_NextButton"
                    action={onSubmit}
                    disabled={isDisabledButtonState}>
                    {txError ? LL.COMMON_BTN_TRY_AGAIN() : LL.COMMON_BTN_CONFIRM()}
                </SendContent.Footer.Next>
            </SendContent.Footer>
        </SendContent>
    )
}

const baseStyles = () =>
    StyleSheet.create({
        root: {
            flex: 1,
            flexDirection: "column",
            gap: 16,
        },
    })
