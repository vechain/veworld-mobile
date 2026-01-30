import { Transaction, TransactionClause } from "@vechain/sdk-core"
import { AxiosError } from "axios"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { showWarningToast, useFeatureFlags } from "~Components"
import { showErrorToast } from "~Components/Base/BaseToast"
import { AnalyticsEvent, B3TR, ERROR_EVENTS, GasPriceCoefficient, VET, VTHO } from "~Constants"
import {
    SignStatus,
    SignTransactionResponse,
    useAnalyticTracking,
    useCheckIdentity,
    useDelegation,
    useSignTransaction,
    useTransactionBuilder,
    useTransactionGas,
} from "~Hooks"
import { useGenericDelegationFees } from "~Hooks/useGenericDelegationFees"
import { useGenericDelegationTokens } from "~Hooks/useGenericDelegationTokens"
import { useDelegatorDepositAddress } from "~Hooks/useDelegatorDepositAddress"
import { useIsEnoughGas } from "~Hooks/useIsEnoughGas"
import { useIsGalactica } from "~Hooks/useIsGalactica"
import { useSendTransaction } from "~Hooks/useSendTransaction"
import { useTransactionFees } from "~Hooks/useTransactionFees/useTransactionFees"
import { useI18nContext } from "~i18n"
import { DEVICE_TYPE, NETWORK_TYPE, TransactionRequest } from "~Model"
import { Routes } from "~Navigation"
import {
    GENERIC_DELEGATOR_BASE_URL,
    isGenericDelegatorUrl,
    isValidGenericDelegatorNetwork,
} from "~Networking/GenericDelegator"
import {
    selectDefaultDelegationToken,
    selectDevice,
    selectSelectedAccount,
    selectSelectedNetwork,
    setIsAppLoading,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"
import { BigNutils, error } from "~Utils"
import { useSmartWallet } from "../useSmartWallet"

type Props = {
    clauses: TransactionClause[]
    onTransactionSuccess: (transaction: Transaction, txId: string) => void | Promise<void>
    onTransactionFailure: (error: unknown) => void | Promise<void>
    initialRoute?: Routes.HOME | Routes.NFTS
    dappRequest?: TransactionRequest
    /**
     * Fallback to VTHO for delegation fees if the user doesn't have enough of the selected token
     */
    autoVTHOFallback?: boolean
    onNavigateToLedger?: () => void
}

const mapGasPriceCoefficient = (value: GasPriceCoefficient) => {
    switch (value) {
        case GasPriceCoefficient.REGULAR:
            return "SLOW"
        case GasPriceCoefficient.MEDIUM:
            return "NORMAL"
        case GasPriceCoefficient.HIGH:
            return "FAST"
    }
}

const getGenericDelegationForSmartWallet = (
    deviceType: DEVICE_TYPE,
    token: string,
    genericDelegatorFees: ReturnType<typeof useGenericDelegationFees>,
    selectedFeeOption: GasPriceCoefficient,
    depositAccount: string,
) => {
    if (deviceType !== DEVICE_TYPE.SMART_WALLET || genericDelegatorFees.allOptions === undefined) return undefined

    const tokenAddressMap = {
        [VET.symbol]: VET.address,
        [B3TR.symbol]: B3TR.address,
        // [VTHO.symbol]: VTHO.address,
    }

    const feeMap = {
        [VET.symbol]: genericDelegatorFees.allOptions?.vetWithSmartAccount[selectedFeeOption].maxFee,
        [B3TR.symbol]: genericDelegatorFees.allOptions?.b3trWithSmartAccount[selectedFeeOption].maxFee,
        // [VTHO.symbol]: genericDelegatorFees.allOptions?.vthoWithSmartAccount[selectedFeeOption].maxFee,
    }

    return {
        token,
        tokenAddress: tokenAddressMap[token],
        fee: feeMap[token],
        depositAccount: depositAccount ?? "",
    }
}

export const useTransactionScreen = ({
    clauses: _clauses,
    onTransactionSuccess: propsOnTransactionSuccess,
    onTransactionFailure,
    dappRequest,
    initialRoute,
    onNavigateToLedger,
    autoVTHOFallback = true,
}: Props) => {
    const { LL } = useI18nContext()
    const dispatch = useAppDispatch()
    const selectedAccount = useAppSelector(selectSelectedAccount)

    const clauses = useMemo(() => {
        return _clauses.map(clause => ({
            value: `0x${BigNutils(clause.value || 0).toHex}`,
            data: clause.data,
            to: clause.to,
        }))
    }, [_clauses])

    const [loading, setLoading] = useState(false)
    const [selectedFeeOption, setSelectedFeeOption] = useState(GasPriceCoefficient.MEDIUM)

    const track = useAnalyticTracking()

    const senderDevice = useAppSelector(state => selectDevice(state, selectedAccount.rootAddress))
    const { forks } = useFeatureFlags()

    const defaultToken = useAppSelector(selectDefaultDelegationToken)
    const [selectedDelegationToken, setSelectedDelegationToken] = useState(defaultToken)

    const selectedNetwork = useAppSelector(selectSelectedNetwork)

    const { buildTransaction: buildTransactionWithSmartWallet } = useSmartWallet()
    const { tokens: availableTokens, isLoading: isLoadingTokens } = useGenericDelegationTokens()
    const { depositAccount, isLoading: isLoadingDepositAccount } = useDelegatorDepositAddress()

    const [transactionClauses, setTransactionClauses] = useState<TransactionClause[]>(clauses)
    const [isLoadingClauses, setIsLoadingClauses] = useState(false)

    useEffect(() => {
        const buildClauses = async () => {
            if (selectedAccount.device.type === DEVICE_TYPE.SMART_WALLET) {
                setIsLoadingClauses(true)
                try {
                    const smartWalletTx = await buildTransactionWithSmartWallet(clauses)
                    setTransactionClauses(smartWalletTx.body.clauses)
                } catch (e) {
                    error(ERROR_EVENTS.SEND, e)
                    setTransactionClauses(clauses)
                } finally {
                    setIsLoadingClauses(false)
                }
            } else {
                setTransactionClauses(clauses)
            }
        }

        buildClauses()
    }, [selectedAccount.device.type, buildTransactionWithSmartWallet, clauses])

    // 1. Gas
    const { gas, loadingGas, setGasPayer } = useTransactionGas({
        clauses: isLoadingClauses ? [] : transactionClauses,
        providedGas: dappRequest?.options?.gas,
        disabled: isLoadingClauses,
    })

    const transactionOutputs = useMemo(() => gas?.outputs, [gas?.outputs])

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

    useEffect(() => {
        if (availableTokens.length === 1 && !isLoadingTokens) {
            resetDelegation()
            setSelectedDelegationToken(VTHO.symbol)
        }
    }, [availableTokens.length, isLoadingTokens, resetDelegation])

    const { isGalactica: isGalacticaRaw } = useIsGalactica()

    const onTransactionSuccess: typeof propsOnTransactionSuccess = useCallback(
        (tx, id) => {
            track(AnalyticsEvent.TRANSACTION_SEND_GAS, { gasOption: mapGasPriceCoefficient(selectedFeeOption) })
            track(AnalyticsEvent.TRANSACTION_SEND_DELEGATION, { delegationOption: selectedDelegationOption })
            if (selectedNetwork.type === NETWORK_TYPE.MAIN)
                track(AnalyticsEvent.TRANSACTION_SEND_DELEGATION_TOKEN, {
                    delegationToken: selectedDelegationToken,
                })
            propsOnTransactionSuccess(tx, id)
        },
        [
            propsOnTransactionSuccess,
            selectedDelegationOption,
            selectedDelegationToken,
            selectedFeeOption,
            selectedNetwork.type,
            track,
        ],
    )

    const isGalactica = useMemo(() => {
        if (!isGalacticaRaw) return false
        if (senderDevice?.type === DEVICE_TYPE.LEDGER) return forks?.GALACTICA?.transactions?.ledger || false
        return true
    }, [forks?.GALACTICA?.transactions?.ledger, isGalacticaRaw, senderDevice?.type])

    // 3. Priority fees
    const transactionFeesResponse = useTransactionFees({
        coefficient: selectedFeeOption,
        gas,
        isGalactica,
    })

    const genericDelegatorFees = useGenericDelegationFees({
        clauses: isLoadingClauses ? [] : transactionClauses,
        signer: selectedAccount.address,
        token: selectedDelegationToken,
        isGalactica,
    })

    const gasOptions = useMemo(() => {
        if (selectedDelegationToken === VTHO.symbol || genericDelegatorFees.options === undefined)
            return transactionFeesResponse.options
        return genericDelegatorFees.options
    }, [genericDelegatorFees.options, selectedDelegationToken, transactionFeesResponse.options])

    const selectedFeeAllTokenOptions = useMemo(() => {
        if (
            (genericDelegatorFees.allOptions === undefined && genericDelegatorFees.isLoading) ||
            transactionFeesResponse.options === undefined
        )
            return undefined
        return Object.fromEntries(
            Object.entries(genericDelegatorFees.allOptions ?? {})
                .map(([token, value]) => [token, value[selectedFeeOption].maxFee] as const)
                .concat([[VTHO.symbol, transactionFeesResponse.options[selectedFeeOption].maxFee]]),
        )
    }, [
        genericDelegatorFees.allOptions,
        genericDelegatorFees.isLoading,
        selectedFeeOption,
        transactionFeesResponse.options,
    ])

    const isFirstTimeLoadingFees = useMemo(
        () =>
            genericDelegatorFees.isFirstTimeLoading ||
            transactionFeesResponse.isFirstTimeLoading ||
            loadingGas ||
            isLoadingClauses,
        [
            genericDelegatorFees.isFirstTimeLoading,
            loadingGas,
            transactionFeesResponse.isFirstTimeLoading,
            isLoadingClauses,
        ],
    )

    const { hasEnoughBalance, hasEnoughBalanceOnAny, hasEnoughBalanceOnToken, hasEnoughBalanceForFeeOnly } =
        useIsEnoughGas({
            selectedToken: selectedDelegationToken,
            isDelegated,
            allFeeOptions: selectedFeeAllTokenOptions,
            isLoadingFees: isFirstTimeLoadingFees,
            transactionOutputs,
            origin: selectedAccount.address,
        })

    const { buildTransaction } = useTransactionBuilder({
        clauses,
        gas,
        isDelegated,
        dependsOn: dappRequest?.options?.dependsOn,
        //We don't care about sending the correct gasOptions for the generic delegator, since the tx will be retrieved from the delegator itself
        ...transactionFeesResponse.txOptions[selectedFeeOption],
        deviceType: selectedAccount.device.type,
        genericDelgationDetails: getGenericDelegationForSmartWallet(
            selectedAccount.device.type,
            selectedDelegationToken,
            genericDelegatorFees,
            selectedFeeOption,
            depositAccount,
        ),
    })

    // 5. Sign transaction
    const { signTransaction } = useSignTransaction({
        buildTransaction,
        selectedDelegationAccount,
        selectedDelegationOption,
        selectedDelegationUrl,
        dappRequest,
        initialRoute,
        selectedDelegationToken,
        genericDelegatorFee: genericDelegatorFees.options?.[selectedFeeOption].maxFee,
        genericDelegatorDepositAccount: depositAccount,
    })

    // 6. Send transaction
    const { sendTransaction } = useSendTransaction(onTransactionSuccess)

    const parseTxError = useCallback(
        (e: unknown) => {
            if (!(e instanceof AxiosError)) return LL.SEND_TRANSACTION_ERROR_GENERIC_ERROR()
            if (e.response?.data?.includes("insufficient energy"))
                return LL.SEND_TRANSACTION_ERROR_INSUFFICIENT_ENERGY()
            if (e.response?.data?.includes("gas price is less than block base fee"))
                return LL.SEND_TRANSACTION_ERROR_GAS_FEE()
            return LL.SEND_TRANSACTION_ERROR_GENERIC_ERROR()
        },
        [LL],
    )

    const sendTransactionSafe = useCallback(
        async (signedTx: Transaction) => {
            try {
                await sendTransaction(signedTx)
            } catch (e) {
                showErrorToast({
                    text1: LL.ERROR(),
                    text2: `${LL.SEND_TRANSACTION_ERROR()}${parseTxError(e)}`,
                })
                await onTransactionFailure(e)
            } finally {
                setLoading(false)
                dispatch(setIsAppLoading(false))
            }
        },
        [sendTransaction, LL, parseTxError, onTransactionFailure, dispatch],
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
                        onNavigateToLedger?.()
                        return
                    case SignStatus.DELEGATION_FAILURE:
                        resetDelegation()
                        setSelectedDelegationToken(VTHO.symbol)
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
                await onTransactionFailure(e)
            } finally {
                setLoading(false)
                dispatch(setIsAppLoading(false))
            }
        },
        [signTransaction, onNavigateToLedger, resetDelegation, LL, sendTransactionSafe, dispatch, onTransactionFailure],
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
            await checkIdentityBeforeOpening()
        } catch (e) {
            error(ERROR_EVENTS.SEND, e)
            await onTransactionFailure(e)
        } finally {
            isSubmitting.current = false
        }
    }, [checkIdentityBeforeOpening, onTransactionFailure])

    const isSmartWalletLoading = useMemo(
        () =>
            selectedAccount.device.type === DEVICE_TYPE.SMART_WALLET &&
            (isLoadingClauses || isLoadingDepositAccount || genericDelegatorFees.isLoading),
        [selectedAccount.device.type, isLoadingClauses, isLoadingDepositAccount, genericDelegatorFees.isLoading],
    )

    const isLoading = useMemo(
        () => loading || loadingGas || isBiometricsEmpty || isLoadingClauses || isSmartWalletLoading,
        [loading, loadingGas, isBiometricsEmpty, isLoadingClauses, isSmartWalletLoading],
    )

    const fallbackToVTHO = useCallback(() => {
        // Only fallback if the token's total balance can't cover the fee at all
        // This allows tokens being sent to stay selected (send amount will be reduced)
        const canCoverFee = hasEnoughBalanceForFeeOnly[selectedDelegationToken]
        if (!canCoverFee && selectedDelegationToken !== VTHO.symbol) setSelectedDelegationToken(VTHO.symbol)
    }, [hasEnoughBalanceForFeeOnly, selectedDelegationToken])

    useEffect(() => {
        if (autoVTHOFallback) fallbackToVTHO()
    }, [autoVTHOFallback, fallbackToVTHO, hasEnoughBalance, selectedDelegationToken])

    useEffect(() => {
        if (selectedDelegationToken !== VTHO.symbol && isValidGenericDelegatorNetwork(selectedNetwork.type))
            setSelectedDelegationUrl(GENERIC_DELEGATOR_BASE_URL[selectedNetwork.type])
    }, [selectedDelegationToken, selectedNetwork.type, setSelectedDelegationUrl])

    useEffect(() => {
        if (selectedDelegationToken === VTHO.symbol && isGenericDelegatorUrl(selectedDelegationUrl ?? ""))
            resetDelegation()
    }, [resetDelegation, selectedDelegationToken, selectedDelegationUrl])

    const isDisabledButtonState = useMemo(
        () => !hasEnoughBalance || loading || isSubmitting.current || (gas?.gas ?? 0) === 0 || isSmartWalletLoading,
        [hasEnoughBalance, loading, gas?.gas, isSmartWalletLoading],
    )

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
        isEnoughGas: hasEnoughBalance,
        isDelegated,
        selectedDelegationAccount,
        selectedDelegationUrl,
        isDisabledButtonState,
        estimatedFee: transactionFeesResponse.estimatedFee,
        maxFee: transactionFeesResponse.maxFee,
        gasOptions,
        gasUpdatedAt: transactionFeesResponse.dataUpdatedAt,
        isGalactica,
        isBaseFeeRampingUp: transactionFeesResponse.isBaseFeeRampingUp,
        speedChangeEnabled: transactionFeesResponse.speedChangeEnabled,
        selectedDelegationToken,
        setSelectedDelegationToken,
        availableTokens,
        fallbackToVTHO,
        hasEnoughBalanceOnAny,
        isFirstTimeLoadingFees,
        hasEnoughBalanceOnToken,
        hasEnoughBalanceForFeeOnly,
        isBiometricsEmpty,
        transactionOutputs,
    }
}
