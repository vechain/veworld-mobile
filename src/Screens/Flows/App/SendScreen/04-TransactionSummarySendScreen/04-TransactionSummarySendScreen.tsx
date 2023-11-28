import React, { useCallback, useEffect, useMemo } from "react"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { useAnalyticTracking, useTheme, useTransactionScreen, useTransferAddContact } from "~Hooks"
import { AddressUtils, BigNumberUtils, TransactionUtils, error } from "~Utils"
import { AnalyticsEvent, COLORS } from "~Constants"
import {
    BaseSpacer,
    BaseText,
    BaseView,
    DelegationView,
    FadeoutButton,
    GasFeeOptions,
    Layout,
    RequireUserPassword,
    TransferCard,
} from "~Components"
import { RootStackParamListHome, Routes } from "~Navigation"
import {
    addPendingTransferTransactionActivity,
    selectAccounts,
    selectCurrency,
    selectCurrencyExchangeRate,
    selectPendingTx,
    selectSelectedAccount,
    setIsAppLoading,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"
import { useI18nContext } from "~i18n"
import { useNavigation } from "@react-navigation/native"
import { ContactType, DEVICE_TYPE, FungibleTokenWithBalance } from "~Model"
import { Transaction } from "thor-devkit"
import { ContactManagementBottomSheet } from "../../ContactsScreen"
import Animated, { interpolateColor, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated"
import { StyleSheet } from "react-native"

type Props = NativeStackScreenProps<RootStackParamListHome, Routes.TRANSACTION_SUMMARY_SEND>

export const TransactionSummarySendScreen = ({ route }: Props) => {
    const { token, amount, address } = route.params

    const { LL } = useI18nContext()
    const dispatch = useAppDispatch()
    const track = useAnalyticTracking()
    const nav = useNavigation()

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

    const clauses = useMemo(
        () => TransactionUtils.prepareFungibleClause(amount, token, address),
        [amount, token, address],
    )

    const {
        selectedDelegationOption,
        loadingGas,
        onSubmit,
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
    } = useTransactionScreen({
        clauses,
        onTransactionSuccess,
        onTransactionFailure,
        initialRoute: Routes.HOME,
    })

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

    const formattedFiatAmount = useMemo(() => {
        const _amount = BigNumberUtils()
            .toCurrencyConversion(token.symbol.toLowerCase() === "vtho" ? formattedTotalCost : amount, exchangeRate)
            .toCurrencyFormat_string(2)

        if (_amount.includes("<")) {
            return `${_amount} ${currency}`
        } else {
            return `≈ ${_amount} ${currency}`
        }
    }, [amount, currency, exchangeRate, formattedTotalCost, token.symbol])

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
                    <BaseText typographyFont="buttonSecondary">{formattedFiatAmount}</BaseText>
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

                        {exchangeRate && <BaseText typographyFont="buttonSecondary">{formattedFiatAmount}</BaseText>}
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
