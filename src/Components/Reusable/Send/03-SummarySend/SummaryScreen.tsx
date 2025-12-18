import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { StyleSheet } from "react-native"
import Animated from "react-native-reanimated"
import { BaseView } from "~Components"
import { useTokenSendContext } from "~Components/Reusable/Send"
import { GasPriceCoefficient, VTHO } from "~Constants"
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
    const [enableSameTokenFeeHandling, setEnableSameTokenFeeHandling] = useState(false)

    const [storedGasOptions, setStoredGasOptions] = useState<any>(null)
    const [storedIsDelegated, setStoredIsDelegated] = useState(false)
    const [storedSelectedFeeOption, setStoredSelectedFeeOption] = useState<GasPriceCoefficient>(
        GasPriceCoefficient.REGULAR,
    )

    const onFailure = useCallback(() => setTxError(true), [setTxError])
    const { onTransactionSuccess, onTransactionFailure } = useTransactionCallbacks({
        token: token,
        onFailure,
    })

    /**
     * Calculate the amount to use in transaction clauses.
     * When using same token for fees, subtract the fee so delegator can add their fee clause.
     */
    const clauseAmount = useMemo(() => {
        if (!enableSameTokenFeeHandling || !storedIsDelegated || !storedGasOptions) {
            return flowState.amount!
        }

        const fee = storedGasOptions[storedSelectedFeeOption].maxFee

        const amountInWei = BigNutils(flowState.amount!).multiply(BigNutils(10).toBN.pow(token.decimals))

        const clauseAmountInWei = amountInWei.minus(fee.toBN)

        if (clauseAmountInWei.isLessThanOrEqual("0")) {
            return flowState.amount!
        }

        return clauseAmountInWei.toHuman(token.decimals).decimals(4).toString
    }, [
        enableSameTokenFeeHandling,
        storedIsDelegated,
        storedGasOptions,
        storedSelectedFeeOption,
        flowState.amount,
        token.decimals,
    ])

    const clauses = useMemo(() => {
        return TransactionUtils.prepareFungibleClause(clauseAmount, token, address!)
    }, [clauseAmount, token, address])

    const {
        isEnoughGas,
        isDelegated,
        gasOptions,
        selectedFeeOption,
        selectedDelegationToken,
        fallbackToVTHO,
        isDisabledButtonState,
        onSubmit: originalOnSubmit,
        ...transactionProps
    } = useTransactionScreen({
        clauses,
        onTransactionSuccess,
        onTransactionFailure,
        autoVTHOFallback: false,
        enableSameTokenFeeHandling,
    })

    useEffect(() => {
        if (gasOptions) {
            setStoredGasOptions(gasOptions)
        }
    }, [gasOptions])

    useEffect(() => {
        setStoredIsDelegated(isDelegated)
    }, [isDelegated])

    useEffect(() => {
        setStoredSelectedFeeOption(selectedFeeOption)
    }, [selectedFeeOption])

    const onSubmit = useCallback(() => {
        return originalOnSubmit()
    }, [originalOnSubmit])

    /**
     * When user selects same token for fees, calculate max sendable amount accounting for fees with buffer.
     * When different token is selected, restore original amount or fallback to VTHO if insufficient balance.
     */
    useEffect(() => {
        const isSameTokenForFees = selectedDelegationToken.toLowerCase() === token.symbol.toLowerCase()
        setEnableSameTokenFeeHandling(isSameTokenForFees)

        if (isDelegated && selectedDelegationToken === VTHO.symbol) {
            return
        }

        // If different token for fees
        if (!isSameTokenForFees) {
            // Fallback to VTHO if not enough gas
            if (!isEnoughGas) {
                fallbackToVTHO()
            }
            return
        }

        const gasFees = gasOptions[selectedFeeOption].maxFee
        const balance = BigNutils(token.balance.balance)
        const amountInWei = BigNutils(flowState.amount!).multiply(BigNutils(10).toBN.pow(18))
        const maxSendableAmount = balance.minus(gasFees.toBN)

        if (maxSendableAmount.isLessThanOrEqual("0")) {
            fallbackToVTHO()
            setFlowState(prev => ({
                ...prev,
                amount: originalAmount.current,
            }))
            return
        }

        if (amountInWei.plus(gasFees.toBN).isBiggerThan(balance.toBN)) {
            const adjustedAmount = maxSendableAmount.clone().toHuman(token.decimals).decimals(4).toString
            setFlowState(prev => ({
                ...prev,
                amount: adjustedAmount,
                amountInFiat: false,
            }))
            setHasGasAdjustment(true)
        }
    }, [
        selectedDelegationToken,
        token.symbol,
        isDelegated,
        isEnoughGas,
        gasOptions,
        selectedFeeOption,
        token.balance.balance,
        token.decimals,
        fallbackToVTHO,
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
                <SendContent.Footer.Next action={onSubmit} disabled={isDisabledButtonState}>
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
