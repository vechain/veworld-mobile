import { Transaction } from "thor-devkit"
import { useCallback, useEffect, useMemo, useState } from "react"
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
import { useI18nContext } from "~i18n"
import {
    selectSelectedAccount,
    selectVthoTokenWithBalanceByAccount,
    setIsAppLoading,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"
import { showErrorToast, showWarningToast } from "~Components"
import { GasUtils, error } from "~Utils"
import { DEVICE_TYPE, LedgerAccountWithDevice, TransactionRequest } from "~Model"
import { DelegationType } from "~Model/Delegation"
import { GasPriceCoefficient } from "~Constants"

type Props = {
    clauses: Transaction.Body["clauses"]
    onTransactionSuccess: (transaction: Transaction, txId: string) => void
    onTransactionFailure: (error: unknown) => void
    dappRequest?: TransactionRequest
}

export const useTransactionScreen = ({ clauses, onTransactionSuccess, onTransactionFailure, dappRequest }: Props) => {
    const { LL } = useI18nContext()
    const dispatch = useAppDispatch()
    const selectedAccount = useAppSelector(selectSelectedAccount)

    const [loading, setLoading] = useState(false)
    const [selectedFeeOption, setSelectedFeeOption] = useState(String(GasPriceCoefficient.REGULAR))
    const [isEnoughGas, setIsEnoughGas] = useState(true)
    const [txCostTotal, setTxCostTotal] = useState("0")

    // 1. Gas
    const { gas, loadingGas, setGasPayer } = useTransactionGas({
        clauses,
    })

    // 2. Delegation
    const {
        setNoDelegation,
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

    // 3. Priority fees
    const { gasPriceCoef, priorityFees, gasFeeOptions } = useMemo(
        () =>
            GasUtils.getGasByCoefficient({
                gas,
                selectedFeeOption,
            }),
        [gas, selectedFeeOption],
    )

    // 4. Build transaction
    const { buildTransaction } = useTransactionBuilder({
        clauses,
        gas,
        isDelegated,
        dependsOn: dappRequest?.options?.dependsOn,
        providedGas: dappRequest?.options?.gas,
        gasPriceCoef,
    })

    // 5. Sign transaction
    const { signTransaction, navigateToLedger } = useSignTransaction({
        buildTransaction,
        selectedDelegationAccount,
        selectedDelegationOption,
        selectedDelegationUrl,
        dappRequest,
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

    const vtho = useAppSelector(state =>
        selectVthoTokenWithBalanceByAccount(state, selectedDelegationAccount?.address ?? selectedAccount.address),
    )

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
                        showWarningToast({
                            text1: LL.ERROR(),
                            text2: LL.SEND_DELEGATION_ERROR_SIGNATURE(),
                        })
                        return
                    default:
                        await sendTransactionSafe(transaction)
                }
            } catch (e) {
                error("signAndSendTransaction", e)
                showErrorToast({
                    text1: LL.ERROR(),
                    text2: LL.SIGN_TRANSACTION_ERROR(),
                })
                setLoading(false)
                dispatch(setIsAppLoading(false))
                onTransactionFailure(e)
            }
        },
        [sendTransactionSafe, onTransactionFailure, dispatch, signTransaction, LL],
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

    const onSubmit = useCallback(async () => {
        if (selectedAccount.device.type === DEVICE_TYPE.LEDGER && selectedDelegationOption !== DelegationType.ACCOUNT) {
            const tx = buildTransaction()

            try {
                await navigateToLedger(tx, selectedAccount as LedgerAccountWithDevice, undefined)
            } catch (e) {
                error("onSubmit:navigateToLedger", e)
                onTransactionFailure(e)
            }
        } else {
            await checkIdentityBeforeOpening()
        }
    }, [
        onTransactionFailure,
        buildTransaction,
        selectedAccount,
        selectedDelegationOption,
        navigateToLedger,
        checkIdentityBeforeOpening,
    ])

    const isLoading = useMemo(
        () => loading || loadingGas || isBiometricsEmpty,
        [loading, loadingGas, isBiometricsEmpty],
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
            priorityFees,
        })

        setIsEnoughGas(isGas)
        setTxCostTotal(_txCostTotal.toString)
    }, [clauses, gas, isDelegated, selectedFeeOption, vtho, selectedAccount, priorityFees])

    const isDissabledButtonState = useMemo(() => !isEnoughGas && !isDelegated, [isEnoughGas, isDelegated])

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
        gasFeeOptions,
        setNoDelegation,
        setSelectedDelegationAccount,
        setSelectedDelegationUrl,
        isEnoughGas,
        txCostTotal,
        isDelegated,
        selectedDelegationAccount,
        selectedDelegationUrl,
        vtho,
        isDissabledButtonState,
        priorityFees,
    }
}
