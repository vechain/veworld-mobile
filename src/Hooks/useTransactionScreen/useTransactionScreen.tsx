import { Transaction, TransactionClause } from "@vechain/sdk-core"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { showErrorToast, showWarningToast } from "~Components"
import { ERROR_EVENTS, GasPriceCoefficient } from "~Constants"
import {
    SignStatus,
    SignTransactionResponse,
    useCheckIdentity,
    useDelegation,
    useSendTransaction,
    useSignTransaction,
    useTransactionBuilder,
    useTransactionGas,
} from "~Hooks"
import { useIsGalactica } from "~Hooks/useIsGalactica"
import { useTransactionFees } from "~Hooks/useTransactionFees/useTransactionFees"
import { useI18nContext } from "~i18n"
import { DEVICE_TYPE, LedgerAccountWithDevice, TransactionRequest } from "~Model"
import { DelegationType } from "~Model/Delegation"
import { Routes } from "~Navigation"
import { selectSelectedAccount, setIsAppLoading, useAppDispatch, useAppSelector } from "~Storage/Redux"
import { error, GasUtils } from "~Utils"
import { useVTHO_HACK } from "./useVTHO_HACK"

type Props = {
    clauses: TransactionClause[]
    onTransactionSuccess: (transaction: Transaction, txId: string) => void
    onTransactionFailure: (error: unknown) => void
    initialRoute?: Routes.HOME | Routes.NFTS
    dappRequest?: TransactionRequest
}

export const useTransactionScreen = ({
    clauses,
    onTransactionSuccess,
    onTransactionFailure,
    dappRequest,
    initialRoute,
}: Props) => {
    const { LL } = useI18nContext()
    const dispatch = useAppDispatch()
    const selectedAccount = useAppSelector(selectSelectedAccount)

    const [loading, setLoading] = useState(false)
    const [selectedFeeOption, setSelectedFeeOption] = useState(GasPriceCoefficient.MEDIUM)
    const [isEnoughGas, setIsEnoughGas] = useState(true)
    const [txCostTotal, setTxCostTotal] = useState("0")

    // 1. Gas
    const { gas, loadingGas, setGasPayer } = useTransactionGas({
        clauses,
        providedGas: dappRequest?.options?.gas,
    })

    // 2. Delegation
    const {
        resetDelegation,
        setSelectedDelegationAccount,
        setSelectedDelegationUrl,
        selectedDelegationOption,
        selectedDelegationAccount,
        selectedDelegationUrl,
        isDelegated,
    } = useDelegation({
        setGasPayer,
        providedUrl: dappRequest?.options?.delegator?.url,
    })

    const { isGalactica, loading: isGalacticaLoading, blockId } = useIsGalactica()

    // 3. Priority fees
    const transactionFeesResponse = useTransactionFees({
        coefficient: selectedFeeOption,
        gas,
        isGalactica,
        blockId,
    })

    // 4. Build transaction
    const { buildTransaction } = useTransactionBuilder({
        clauses,
        gas,
        isDelegated,
        dependsOn: dappRequest?.options?.dependsOn,
        ...transactionFeesResponse.txOptions[selectedFeeOption],
    })

    // 5. Sign transaction
    const { signTransaction, navigateToLedger } = useSignTransaction({
        buildTransaction,
        selectedDelegationAccount,
        selectedDelegationOption,
        selectedDelegationUrl,
        dappRequest,
        initialRoute,
        resetDelegation,
    })

    // 6. Send transaction
    const { sendTransaction } = useSendTransaction(onTransactionSuccess)

    const sendTransactionSafe = useCallback(
        async (signedTx: Transaction) => {
            try {
                await sendTransaction(signedTx)
            } catch (e) {
                showErrorToast({
                    text1: LL.ERROR(),
                    text2: LL.SEND_TRANSACTION_ERROR(),
                })
                onTransactionFailure(e)
            }
        },
        [sendTransaction, onTransactionFailure, LL],
    )

    const vtho = useVTHO_HACK(selectedDelegationAccount?.address ?? selectedAccount.address)

    /**
     * Signs the transaction and sends it to the blockchain
     */
    const signAndSendTransaction = useCallback(
        async (password?: string) => {
            setLoading(true)

            try {
                const transaction: SignTransactionResponse = await signTransaction(password)

                switch (transaction) {
                    case SignStatus.NAVIGATE_TO_LEDGER:
                        return
                    case SignStatus.DELEGATION_FAILURE:
                        resetDelegation()
                        showWarningToast({
                            text1: LL.ERROR(),
                            text2: LL.SEND_DELEGATION_ERROR_SIGNATURE(),
                        })
                        return
                    default:
                        await sendTransactionSafe(transaction)
                }
            } catch (e) {
                error(ERROR_EVENTS.SIGN, e)
                showErrorToast({
                    text1: LL.ERROR(),
                    text2: LL.SIGN_TRANSACTION_ERROR(),
                })
                setLoading(false)
                dispatch(setIsAppLoading(false))
                onTransactionFailure(e)
            }
        },
        [signTransaction, resetDelegation, LL, sendTransactionSafe, dispatch, onTransactionFailure],
    )

    const {
        onPasswordSuccess,
        checkIdentityBeforeOpening,
        isPasswordPromptOpen,
        isBiometricsEmpty,
        handleClosePasswordModal,
    } = useCheckIdentity({
        onIdentityConfirmed: signAndSendTransaction,
        onCancel: () => setLoading(false),
        allowAutoPassword: true,
    })

    const isSubmitting = useRef(false)

    const onSubmit = useCallback(async () => {
        if (isSubmitting.current) return
        isSubmitting.current = true

        try {
            if (
                selectedAccount.device.type === DEVICE_TYPE.LEDGER &&
                selectedDelegationOption !== DelegationType.ACCOUNT
            ) {
                const tx = buildTransaction()
                await navigateToLedger(tx, selectedAccount as LedgerAccountWithDevice, undefined)
            } else {
                await checkIdentityBeforeOpening()
            }
        } catch (e) {
            error(ERROR_EVENTS.SEND, e)
            onTransactionFailure(e)
        } finally {
            isSubmitting.current = false
        }
    }, [
        selectedAccount,
        selectedDelegationOption,
        buildTransaction,
        navigateToLedger,
        checkIdentityBeforeOpening,
        onTransactionFailure,
    ])

    const isLoading = useMemo(
        () => loading || loadingGas || isBiometricsEmpty || transactionFeesResponse.isLoading || isGalacticaLoading,
        [loading, loadingGas, isBiometricsEmpty, transactionFeesResponse.isLoading, isGalacticaLoading],
    )

    /**
     * Check if the user has enough funds to send the transaction
     * Calculate the amount to send without the gas fee
     */
    useEffect(() => {
        const { isGas, txCostTotal: _txCostTotal } = GasUtils.calculateIsEnoughGas({
            clauses,
            isDelegated,
            vtho,
            txFee: transactionFeesResponse.maxFee,
        })

        setIsEnoughGas(isGas)
        setTxCostTotal(_txCostTotal.toString)
    }, [clauses, gas, isDelegated, selectedFeeOption, vtho, selectedAccount, transactionFeesResponse.maxFee])

    const isDisabledButtonState = useMemo(
        () =>
            (!isEnoughGas && !isDelegated) ||
            loading ||
            isSubmitting.current ||
            transactionFeesResponse.isLoading ||
            isGalacticaLoading,
        [isEnoughGas, isDelegated, loading, transactionFeesResponse.isLoading, isGalacticaLoading],
    )

    const onRefreshFee = useCallback(() => {}, [])

    return {
        selectedDelegationOption,
        loadingGas,
        onSubmit,
        isLoading,
        isPasswordPromptOpen,
        handleClosePasswordModal,
        onPasswordSuccess,
        setSelectedFeeOption,
        selectedFeeOption,
        resetDelegation,
        setSelectedDelegationAccount,
        setSelectedDelegationUrl,
        isEnoughGas,
        txCostTotal,
        isDelegated,
        selectedDelegationAccount,
        selectedDelegationUrl,
        vtho,
        isDisabledButtonState,
        estimatedFee: transactionFeesResponse.estimatedFee,
        maxFee: transactionFeesResponse.maxFee,
        gasOptions: transactionFeesResponse.options,
        gasUpdatedAt: transactionFeesResponse.dataUpdatedAt,
        onRefreshFee,
        isGalactica,
    }
}
