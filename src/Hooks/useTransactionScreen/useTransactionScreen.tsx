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
import { BigNutils, BigNumberUtils, error } from "~Utils"
import { useSmartWallet } from "../useSmartWallet"
import { useGenericDelegatorRates } from "../useGenericDelegatorRates"

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
    vthoFee: BigNumberUtils | undefined,
    rates: ReturnType<typeof useGenericDelegatorRates>,
) => {
    if (deviceType !== DEVICE_TYPE.SMART_WALLET) {
        return undefined
    }

    const tokenAddressMap: Record<string, string> = {
        [VET.symbol]: VET.address,
        [B3TR.symbol]: B3TR.address,
        [VTHO.symbol]: VTHO.address,
    }

    // For smart accounts, use genericDelegatorFees for ALL tokens (including VTHO)
    // because it accounts for smart account gas overhead
    // Use estimatedFee (with 5% buffer built into the calculation)
    const feeMap: Record<string, BigNumberUtils | undefined> = {
        [VET.symbol]: genericDelegatorFees.allOptions?.[VET.symbol]?.[selectedFeeOption]?.estimatedFee,
        [B3TR.symbol]: genericDelegatorFees.allOptions?.[B3TR.symbol]?.[selectedFeeOption]?.estimatedFee,
        [VTHO.symbol]: genericDelegatorFees.allOptions?.[VTHO.symbol]?.[selectedFeeOption]?.estimatedFee ?? vthoFee,
    }

    // If fee is not available yet (still loading), return undefined
    if (feeMap[token] === undefined) {
        return undefined
    }


    const result = {
        token,
        tokenAddress: tokenAddressMap[token],
        fee: feeMap[token],
        depositAccount: depositAccount ?? "",
        rates: rates.rate && rates.serviceFee !== undefined ? { rate: rates.rate, serviceFee: rates.serviceFee } : undefined,
    }
    return result
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

    // Extract gas prices from txOptions for Galactica (EIP-1559) transactions
    // Backend validates using maxFeePerGas + maxPriorityFeePerGas, so we need to include both
    const gasPricesForDelegation = useMemo(() => {
        if (!isGalactica || !transactionFeesResponse.txOptions) return undefined
        const txOpts = transactionFeesResponse.txOptions
        const regularOpt = txOpts[GasPriceCoefficient.REGULAR]
        const mediumOpt = txOpts[GasPriceCoefficient.MEDIUM]
        const highOpt = txOpts[GasPriceCoefficient.HIGH]
        // Check if txOptions has maxFeePerGas (Galactica) vs gasPriceCoef (legacy)
        if (!("maxFeePerGas" in regularOpt)) return undefined

        // Backend uses: maxFeePerGas + maxPriorityFeePerGas for gas price validation
        const getGasPrice = (opt: { maxFeePerGas: string; maxPriorityFeePerGas: string } | { gasPriceCoef: number }) => {
            if (!("maxFeePerGas" in opt)) return undefined
            const maxFee = BigInt(opt.maxFeePerGas)
            const priorityFee = BigInt(opt.maxPriorityFeePerGas || "0")
            return (maxFee + priorityFee).toString()
        }

        const result = {
            regular: getGasPrice(regularOpt),
            medium: getGasPrice(mediumOpt),
            high: getGasPrice(highOpt),
        }

        return result
    }, [isGalactica, transactionFeesResponse.txOptions])

    // For smart wallets, use original clauses since estimateSmartAccountFees will build them itself
    // Using transactionClauses (pre-built) would cause double-wrapping and incorrect gas estimation
    const isSmartWallet = selectedAccount.device.type === DEVICE_TYPE.SMART_WALLET
    const clausesForDelegationFees = isSmartWallet ? clauses : transactionClauses

    const genericDelegatorFees = useGenericDelegationFees({
        clauses: isLoadingClauses ? [] : clausesForDelegationFees,
        signer: selectedAccount.address,
        token: selectedDelegationToken,
        isGalactica,
        deviceType: selectedAccount.device.type,
        gasPrices: gasPricesForDelegation,
    })
    const genericDelegatorRates = useGenericDelegatorRates()

    const gasOptions = useMemo(() => {
        // For smart accounts, always use genericDelegatorFees (includes smart account overhead)
        // For non-smart accounts with VTHO, use regular transactionFeesResponse
        const isSmartAccount = selectedAccount.device.type === DEVICE_TYPE.SMART_WALLET
        if (isSmartAccount) {
            return genericDelegatorFees.options ?? transactionFeesResponse.options
        }
        if (selectedDelegationToken === VTHO.symbol || genericDelegatorFees.options === undefined)
            return transactionFeesResponse.options
        return genericDelegatorFees.options
    }, [genericDelegatorFees.options, selectedDelegationToken, transactionFeesResponse.options, selectedAccount.device.type])

    const selectedFeeAllTokenOptions = useMemo(() => {
        if (
            (genericDelegatorFees.allOptions === undefined && genericDelegatorFees.isLoading) ||
            transactionFeesResponse.options === undefined
        )
            return undefined

        // For smart accounts, allOptions includes VTHO (calculated locally with smart account overhead)
        // For non-smart accounts, allOptions doesn't include VTHO, so use transactionFeesResponse
        const hasVthoInAllOptions = genericDelegatorFees.allOptions?.[VTHO.symbol] !== undefined

        const result = Object.fromEntries(
            Object.entries(genericDelegatorFees.allOptions ?? {})
                .map(([token, value]) => [token, value[selectedFeeOption].maxFee] as const)
                .concat(
                    // Only add VTHO from transactionFeesResponse if not already in allOptions
                    hasVthoInAllOptions ? [] : [[VTHO.symbol, transactionFeesResponse.options[selectedFeeOption].maxFee]],
                ),
        )
        return result
    }, [genericDelegatorFees.allOptions, genericDelegatorFees.isLoading, selectedFeeOption, transactionFeesResponse.options])

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

    const { hasEnoughBalance, hasEnoughBalanceOnAny, hasEnoughBalanceOnToken } = useIsEnoughGas({
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
            transactionFeesResponse.options?.[selectedFeeOption]?.maxFee,
            genericDelegatorRates,
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
        genericDelegatorFee: genericDelegatorFees.options?.[selectedFeeOption].estimatedFee,
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
        if (!hasEnoughBalance && selectedDelegationToken !== VTHO.symbol) setSelectedDelegationToken(VTHO.symbol)
    }, [hasEnoughBalance, selectedDelegationToken])

    useEffect(() => {
        if (autoVTHOFallback) fallbackToVTHO()
    }, [autoVTHOFallback, fallbackToVTHO, hasEnoughBalance, selectedDelegationToken])

    useEffect(() => {
        // For smart accounts, always use generic delegator regardless of token
        // For non-smart accounts, only use generic delegator for non-VTHO tokens
        const shouldUseGenericDelegator =
            selectedAccount.device.type === DEVICE_TYPE.SMART_WALLET || selectedDelegationToken !== VTHO.symbol

        if (shouldUseGenericDelegator && isValidGenericDelegatorNetwork(selectedNetwork.type))
            setSelectedDelegationUrl(GENERIC_DELEGATOR_BASE_URL[selectedNetwork.type])
    }, [selectedAccount.device.type, selectedDelegationToken, selectedNetwork.type, setSelectedDelegationUrl])

    useEffect(() => {
        // Only reset delegation for VTHO on non-smart accounts
        if (
            selectedAccount.device.type !== DEVICE_TYPE.SMART_WALLET &&
            selectedDelegationToken === VTHO.symbol &&
            isGenericDelegatorUrl(selectedDelegationUrl ?? "")
        )
            resetDelegation()
    }, [resetDelegation, selectedAccount.device.type, selectedDelegationToken, selectedDelegationUrl])


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
        isBiometricsEmpty,
        transactionOutputs,
    }
}
