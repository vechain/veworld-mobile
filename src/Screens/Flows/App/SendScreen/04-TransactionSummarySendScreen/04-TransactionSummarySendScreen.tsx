import React, { useCallback, useEffect, useMemo, useState } from "react"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import {
    SignStatus,
    SignTransactionResponse,
    useAnalyticTracking,
    useCheckIdentity,
    useDelegation,
    useSendTransaction,
    useSignTransaction,
    useTheme,
    useTransactionBuilder,
    useTransactionGas,
    useTransferAddContact,
} from "~Hooks"
import { AddressUtils, BigNumberUtils, GasUtils, TransactionUtils, error } from "~Utils"
import { AnalyticsEvent, COLORS, GasPriceCoefficient } from "~Constants"
import {
    AccountCard,
    BaseCard,
    BaseSpacer,
    BaseText,
    BaseView,
    DelegationOptions,
    FadeoutButton,
    GasFeeOptions,
    Layout,
    RequireUserPassword,
    TransferCard,
    showErrorToast,
    showWarningToast,
} from "~Components"
import { RootStackParamListHome, Routes } from "~Navigation"
import {
    addPendingTransferTransactionActivity,
    selectAccounts,
    selectCurrency,
    selectCurrencyExchangeRate,
    selectPendingTx,
    selectSelectedAccount,
    selectVthoTokenWithBalanceByAccount,
    setIsAppLoading,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"
import { useI18nContext } from "~i18n"
import { useNavigation } from "@react-navigation/native"
import {
    AccountWithDevice,
    ContactType,
    DEVICE_TYPE,
    FungibleTokenWithBalance,
    LedgerAccountWithDevice,
    LocalAccountWithDevice,
} from "~Model"
import { Transaction } from "thor-devkit"
import { ContactManagementBottomSheet } from "../../ContactsScreen"
import { DelegationType } from "~Model/Delegation"
import Animated, { interpolateColor, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated"
import { StyleSheet } from "react-native"

type Props = NativeStackScreenProps<RootStackParamListHome, Routes.TRANSACTION_SUMMARY_SEND>

export const TransactionSummarySendScreen = ({ route }: Props) => {
    const { token, amount, address } = route.params

    const { LL } = useI18nContext()
    const dispatch = useAppDispatch()
    const track = useAnalyticTracking()
    const nav = useNavigation()

    const [isEnoughGas, setIsEnoughGas] = useState(true)
    const [txCostTotal, setTxCostTotal] = useState("0")
    const [selectedFeeOption, setSelectedFeeOption] = useState(String(GasPriceCoefficient.REGULAR))

    const selectedAccount = useAppSelector(selectSelectedAccount)
    const pendingTransaction = useAppSelector(state => selectPendingTx(state, token.address))

    const accounts = useAppSelector(selectAccounts)
    const receiverIsAccount = accounts.find(_account => AddressUtils.compareAddresses(_account.address, address))
    const { onAddContactPress, handleSaveContact, addContactSheet, selectedContactAddress, closeAddContactSheet } =
        useTransferAddContact()

    const navBack = useCallback(() => {
        error(nav.getState())

        if (nav.canGoBack()) return nav.goBack()

        nav.navigate(Routes.DISCOVER)
    }, [nav])

    const onFinish = useCallback(
        (success: boolean) => {
            if (success) track(AnalyticsEvent.SEND_FUNGIBLE_SENT)
            else track(AnalyticsEvent.SEND_FUNGIBLE_FAILED_TO_SEND)

            dispatch(setIsAppLoading(false))

            navBack()
        },
        [track, dispatch, navBack],
    )

    const onTransactionSuccess = useCallback(
        async (transaction: Transaction) => {
            dispatch(addPendingTransferTransactionActivity(transaction))
            onFinish(true)
        },
        [dispatch, onFinish],
    )

    const onTransactionFailure = useCallback(() => {
        onFinish(false)
    }, [onFinish])

    // 0. Create clauses
    const clauses = useMemo(
        () => TransactionUtils.prepareFungibleClause(amount, token, address),
        [amount, token, address],
    )

    // 1. Base Gas
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
        // providedUrl: options?.delegator?.url
    })

    const { gasPriceCoef, priorityFees, gasFeeOptions } = useMemo(
        () =>
            GasUtils.getGasByCoefficient({
                gas,
                selectedFeeOption,
            }),
        [gas, selectedFeeOption],
    )

    // 3. Build transaction
    const { buildTransaction } = useTransactionBuilder({
        clauses,
        gas,
        isDelegated,
        // dependsOn: options?.dependsOn,
        // providedGas: options?.gas,
        gasPriceCoef,
    })

    // 4. Sign transaction
    const { signTransaction, navigateToLedger } = useSignTransaction({
        buildTransaction,
        selectedDelegationAccount,
        selectedDelegationOption,
        selectedDelegationUrl,
        // initialRoute,
        // requestEvent,
    })

    // 5. Send transaction
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
                onTransactionFailure()
            }
        },
        [sendTransaction, onTransactionFailure, LL],
    )

    /**
     * Signs the transaction and sends it to the blockchain
     */
    const signAndSendTransaction = useCallback(
        async (password?: string) => {
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
                onTransactionFailure()
            } finally {
                dispatch(setIsAppLoading(false))
            }
        },
        [sendTransactionSafe, onTransactionFailure, dispatch, signTransaction, LL],
    )

    const { onPasswordSuccess, checkIdentityBeforeOpening, isPasswordPromptOpen, handleClosePasswordModal } =
        useCheckIdentity({
            onIdentityConfirmed: signAndSendTransaction,
            allowAutoPassword: true,
        })

    const onSubmit = useCallback(async () => {
        if (selectedAccount.device.type === DEVICE_TYPE.LEDGER && selectedDelegationOption !== DelegationType.ACCOUNT) {
            const tx = buildTransaction()

            try {
                await navigateToLedger(tx, selectedAccount as LedgerAccountWithDevice, undefined)
            } catch (e) {
                error("onSubmit:navigateToLedger", e)
                onTransactionFailure()
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

    const isDissabledButtonState = useMemo(
        () => !isEnoughGas && selectedDelegationOption !== DelegationType.URL,
        [isEnoughGas, selectedDelegationOption],
    )

    const vtho = useAppSelector(state =>
        selectVthoTokenWithBalanceByAccount(state, selectedDelegationAccount?.address ?? selectedAccount.address),
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

    return (
        <Layout
            safeAreaTestID="Transaction_Summary_Send_Screen"
            title={LL.SEND_TOKEN_TITLE()}
            noStaticBottomPadding
            body={
                <BaseView mb={80} mt={8}>
                    <TransferCard
                        fromAddress={selectedAccount.address}
                        toAddresses={[address]}
                        onAddContactPress={onAddContactPress}
                        isFromAccountLedger={selectedAccount.device?.type === DEVICE_TYPE.LEDGER}
                        isToAccountLedger={receiverIsAccount?.device.type === DEVICE_TYPE.LEDGER}
                    />

                    {!!pendingTransaction && (
                        <>
                            <BaseSpacer height={24} />
                            <BaseText color={COLORS.DARK_RED_ALERT}>{LL.SEND_PENDING_TX_REVERT_ALERT()}</BaseText>
                        </>
                    )}

                    <RequireUserPassword
                        isOpen={isPasswordPromptOpen}
                        onClose={handleClosePasswordModal}
                        onSuccess={onPasswordSuccess}
                    />

                    <DelegationView
                        setNoDelegation={setNoDelegation}
                        selectedDelegationOption={selectedDelegationOption}
                        setSelectedDelegationAccount={setSelectedDelegationAccount}
                        selectedDelegationAccount={selectedDelegationAccount}
                        selectedDelegationUrl={selectedDelegationUrl}
                        setSelectedDelegationUrl={setSelectedDelegationUrl}
                    />

                    <TotalSendAmountView
                        amount={amount}
                        symbol={token.symbol}
                        token={token}
                        txCostTotal={txCostTotal}
                        isDelegated={isDelegated}
                    />

                    <GasFeeOptions
                        setSelectedFeeOption={setSelectedFeeOption}
                        selectedDelegationOption={selectedDelegationOption}
                        loadingGas={loadingGas}
                        selectedFeeOption={selectedFeeOption}
                        gasFeeOptions={gasFeeOptions}
                        isThereEnoughGas={isEnoughGas}
                        totalBalance={vtho.balance.balance}
                        txCostTotal={txCostTotal}
                    />

                    <EstimatedTimeDetailsView />

                    <ContactManagementBottomSheet
                        ref={addContactSheet}
                        contact={{
                            alias: "",
                            address: selectedContactAddress ?? "",
                            type: ContactType.KNOWN,
                        }}
                        onClose={closeAddContactSheet}
                        onSaveContact={handleSaveContact}
                        isAddingContact={true}
                        checkTouched={false}
                    />

                    <BaseSpacer height={12} />
                </BaseView>
            }
            footer={
                <FadeoutButton
                    title={LL.COMMON_BTN_CONFIRM().toUpperCase()}
                    action={onSubmit}
                    disabled={isDissabledButtonState}
                    bottom={0}
                    mx={0}
                    width={"auto"}
                />
            }
        />
    )
}

interface IDelegationView {
    setNoDelegation: () => void
    selectedDelegationOption: DelegationType
    setSelectedDelegationAccount: (account: AccountWithDevice) => void
    selectedDelegationAccount?: LocalAccountWithDevice
    selectedDelegationUrl?: string
    setSelectedDelegationUrl: (url: string) => void
}

function DelegationView({
    setNoDelegation,
    selectedDelegationOption,
    setSelectedDelegationAccount,
    selectedDelegationAccount,
    selectedDelegationUrl,
    setSelectedDelegationUrl,
}: IDelegationView) {
    return (
        <>
            <DelegationOptions
                setNoDelegation={setNoDelegation}
                selectedDelegationOption={selectedDelegationOption}
                setSelectedDelegationAccount={setSelectedDelegationAccount}
                selectedDelegationAccount={selectedDelegationAccount}
                selectedDelegationUrl={selectedDelegationUrl}
                setSelectedDelegationUrl={setSelectedDelegationUrl}
            />
            {selectedDelegationAccount && (
                <>
                    <BaseSpacer height={16} />
                    <AccountCard account={selectedDelegationAccount} />
                </>
            )}
            {selectedDelegationUrl && (
                <>
                    <BaseSpacer height={16} />
                    <BaseCard>
                        <BaseText py={8}>{selectedDelegationUrl}</BaseText>
                    </BaseCard>
                </>
            )}
        </>
    )
}

function EstimatedTimeDetailsView() {
    const { LL } = useI18nContext()
    const theme = useTheme()
    return (
        <>
            <BaseSpacer height={12} />
            <BaseSpacer height={0.5} width={"100%"} background={theme.colors.textDisabled} />
            <BaseSpacer height={12} />
            <BaseText typographyFont="buttonSecondary">{LL.SEND_ESTIMATED_TIME()}</BaseText>
            <BaseSpacer height={6} />
            <BaseText typographyFont="subSubTitle">{LL.SEND_LESS_THAN_1_MIN()}</BaseText>
        </>
    )
}

interface ITotalSendAmountView {
    amount: string
    symbol: string
    token: FungibleTokenWithBalance
    txCostTotal: string
    isDelegated: boolean
}

function TotalSendAmountView({ amount, symbol, token, txCostTotal, isDelegated }: ITotalSendAmountView) {
    const currency = useAppSelector(selectCurrency)
    const exchangeRate = useAppSelector(state => selectCurrencyExchangeRate(state, token))
    const theme = useTheme()
    const { LL } = useI18nContext()

    const animationProgress = useSharedValue(0)

    useEffect(() => {
        animationProgress.value = withTiming(1, { duration: 400 }, () => {
            animationProgress.value = withTiming(0, { duration: 400 })
        })
    }, [txCostTotal, animationProgress])

    const animatedStyle = useAnimatedStyle(() => {
        return { color: interpolateColor(animationProgress.value, [0, 1], [theme.colors.text, theme.colors.danger]) }
    }, [theme.isDark])

    const formattedTotalCost = useMemo(
        () => BigNumberUtils(txCostTotal).toHuman(token.decimals).toString,
        [token.decimals, txCostTotal],
    )

    const formattedFiatAmount = useMemo(
        () =>
            BigNumberUtils()
                .toCurrencyConversion(token.symbol.toLowerCase() === "vtho" ? formattedTotalCost : amount, exchangeRate)
                .toCurrencyFormat(2).toString,
        [amount, exchangeRate, formattedTotalCost, token.symbol],
    )

    return (
        <>
            <BaseSpacer height={24} />
            <BaseText typographyFont="subTitleBold">{LL.SEND_DETAILS()}</BaseText>

            <BaseSpacer height={12} />
            <BaseText typographyFont="caption">{LL.SEND_AMOUNT()}</BaseText>

            <BaseView flexDirection="row">
                <BaseText typographyFont="subSubTitle">{amount}</BaseText>
                <BaseText typographyFont="body" mx={4}>
                    {symbol}
                </BaseText>

                {exchangeRate && token.symbol.toLowerCase() !== "vtho" && (
                    <BaseText typographyFont="buttonSecondary">
                        {"≈ "}
                        {formattedFiatAmount} {currency}
                    </BaseText>
                )}
            </BaseView>

            {/* Show total tx cost if the token is VTHO and the gas fee is not delegated */}
            {token.symbol.toLowerCase() === "vtho" && !isDelegated ? (
                <>
                    <BaseSpacer height={12} />
                    <BaseText typographyFont="caption">{"Total Cost"}</BaseText>
                    <BaseView flexDirection="row">
                        <Animated.Text style={[baseStyles.coloredText, animatedStyle]}>
                            {formattedTotalCost}
                        </Animated.Text>
                        <BaseText typographyFont="body" mx={4}>
                            {symbol}
                        </BaseText>

                        {exchangeRate && (
                            <BaseText typographyFont="buttonSecondary">
                                {"≈ "}
                                {formattedFiatAmount} {currency}
                            </BaseText>
                        )}
                    </BaseView>
                </>
            ) : null}
        </>
    )
}

const baseStyles = StyleSheet.create({
    coloredText: {
        fontFamily: "Inter-Bold",
        fontSize: 16,
        fontWeight: "700",
    },
})

// https://sponsor-testnet.vechain.energy/by/296
