import { useNavigation } from "@react-navigation/native"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { Transaction } from "@vechain/sdk-core"
import { default as React, useCallback, useEffect, useMemo, useState } from "react"
import { StyleSheet } from "react-native"
import Animated, { interpolateColor, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated"
import { getCoinGeckoIdBySymbol, useExchangeRate } from "~Api/Coingecko"
import {
    BackupDevicesAlert,
    BaseSpacer,
    BaseText,
    BaseView,
    DelegationView,
    FadeoutButton,
    FiatBalance,
    GasFeeSpeed,
    Layout,
    RequireUserPassword,
    TransferCard,
} from "~Components"
import { AnalyticsEvent, COLORS, creteAnalyticsEvent, ERROR_EVENTS, VET, VTHO } from "~Constants"
import { useAnalyticTracking, useTheme, useTransferAddContact } from "~Hooks"
import { useFormatFiat } from "~Hooks/useFormatFiat"
import { useTransactionScreen } from "~Hooks/useTransactionScreen"
import { ContactType, DEVICE_TYPE, FungibleTokenWithBalance } from "~Model"
import { RootStackParamListHome, Routes } from "~Navigation"
import {
    addPendingTransferTransactionActivity,
    selectAccounts,
    selectCurrency,
    selectPendingTx,
    selectSelectedAccount,
    selectSelectedNetwork,
    setIsAppLoading,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"
import { AccountUtils, AddressUtils, BigNutils, error, TransactionUtils } from "~Utils"
import { useI18nContext } from "~i18n"
import { ContactManagementBottomSheet } from "../../ContactsScreen"

type Props = NativeStackScreenProps<RootStackParamListHome, Routes.TRANSACTION_SUMMARY_SEND>

export const TransactionSummarySendScreen = ({ route }: Props) => {
    const { token, amount, address, navigation } = route.params

    const { LL } = useI18nContext()
    const dispatch = useAppDispatch()
    const track = useAnalyticTracking()
    const nav = useNavigation()

    const network = useAppSelector(selectSelectedNetwork)
    const selectedAccount = useAppSelector(selectSelectedAccount)
    const pendingTransaction = useAppSelector(state => selectPendingTx(state, token.address))
    const accounts = useAppSelector(selectAccounts)

    const [finalAmount, setFinalAmount] = useState(amount)

    const receiverIsAccount = accounts.find(_account => AddressUtils.compareAddresses(_account.address, address))
    const { onAddContactPress, handleSaveContact, addContactSheet, selectedContactAddress, closeAddContactSheet } =
        useTransferAddContact()

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

            if (navigation)
                nav.navigate(navigation.route, {
                    screen: navigation.screen,
                    params: navigation.params,
                })
            else nav.navigate(Routes.HOME)
            dispatch(setIsAppLoading(false))
        },
        [token.symbol, navigation, nav, dispatch, track, network.name],
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

    /**
     * If user is sending a token and gas is not enough, we will adjust the amount to send.
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
    ])

    return (
        <Layout
            safeAreaTestID="Transaction_Summary_Send_Screen"
            title={LL.SEND_TOKEN_TITLE()}
            noStaticBottomPadding
            body={
                <BaseView mb={80} mt={8}>
                    <BackupDevicesAlert />
                    <TransferCard
                        fromAddress={selectedAccount.address}
                        toAddresses={[address]}
                        onAddContactPress={onAddContactPress}
                        isFromAccountLedger={selectedAccount.device?.type === DEVICE_TYPE.LEDGER}
                        isToAccountLedger={
                            receiverIsAccount?.device && receiverIsAccount?.device.type === DEVICE_TYPE.LEDGER
                        }
                        isObservedWallet={
                            AccountUtils.isObservedAccount(receiverIsAccount) &&
                            receiverIsAccount?.type === DEVICE_TYPE.LOCAL_WATCHED
                        }
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

                    <TotalSendAmountView
                        amount={finalAmount}
                        symbol={token.symbol}
                        token={token}
                        txCostTotal={"0"}
                        isDelegated={isDelegated}
                        isEnoughGas={isEnoughGas}
                    />

                    <GasFeeSpeed
                        gasUpdatedAt={gasUpdatedAt}
                        options={gasOptions}
                        selectedFeeOption={selectedFeeOption}
                        setSelectedFeeOption={setSelectedFeeOption}
                        isGalactica={isGalactica}
                        isBaseFeeRampingUp={isBaseFeeRampingUp}
                        speedChangeEnabled={speedChangeEnabled}
                        availableDelegationTokens={availableTokens}
                        delegationToken={selectedDelegationToken}
                        setDelegationToken={setSelectedDelegationToken}
                        isEnoughBalance={isEnoughGas}
                        hasEnoughBalanceOnAny={hasEnoughBalanceOnAny}
                        isFirstTimeLoadingFees={isFirstTimeLoadingFees}
                        hasEnoughBalanceOnToken={hasEnoughBalanceOnToken}>
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
                    testID="confirm-send-button"
                    title={LL.COMMON_BTN_CONFIRM().toUpperCase()}
                    action={onSubmit}
                    disabled={isDisabledButtonState}
                    bottom={0}
                    mx={0}
                    width={"auto"}
                />
            }
        />
    )
}

interface ITotalSendAmountView {
    amount: string
    symbol: string
    token: FungibleTokenWithBalance
    txCostTotal: string
    isDelegated: boolean
    isEnoughGas: boolean
}

function TotalSendAmountView({
    amount,
    symbol,
    token,
    txCostTotal,
    isDelegated,
    isEnoughGas,
}: Readonly<ITotalSendAmountView>) {
    const currency = useAppSelector(selectCurrency)

    const { data: exchangeRate } = useExchangeRate({
        id: getCoinGeckoIdBySymbol[token.symbol],
        vs_currency: currency,
    })

    const theme = useTheme()
    const { LL } = useI18nContext()
    const { formatLocale } = useFormatFiat()

    const totalTxAnimationProgress = useSharedValue(0)

    useEffect(() => {
        totalTxAnimationProgress.value = withTiming(1, { duration: 400 }, () => {
            totalTxAnimationProgress.value = withTiming(0, { duration: 400 })
        })
    }, [txCostTotal, totalTxAnimationProgress])

    const totalTxAnimatedStyle = useAnimatedStyle(() => {
        return {
            color: interpolateColor(
                totalTxAnimationProgress.value,
                [0, 1],
                [theme.colors.text, isEnoughGas ? theme.colors.success : theme.colors.danger],
            ),
        }
    }, [theme.isDark, isEnoughGas])

    const amountAnimationProgress = useSharedValue(0)

    useEffect(() => {
        amountAnimationProgress.value = withTiming(1, { duration: 400 }, () => {
            amountAnimationProgress.value = withTiming(0, { duration: 400 })
        })
    }, [amount, amountAnimationProgress])

    const amountAanimatedStyle = useAnimatedStyle(() => {
        return {
            color: interpolateColor(
                amountAnimationProgress.value,
                [0, 1],
                [theme.colors.text, isEnoughGas ? theme.colors.success : theme.colors.danger],
            ),
        }
    }, [theme.isDark, isEnoughGas])

    const formattedAmount = useMemo(() => BigNutils(amount).decimals(4).toString, [amount])

    const formattedTotalCost = useMemo(
        () => BigNutils(txCostTotal).toHuman(token.decimals).toTokenFormat_string(4, formatLocale),
        [token.decimals, txCostTotal, formatLocale],
    )
    const isVTHO = useMemo(() => token.symbol.toLowerCase() === VTHO.symbol.toLowerCase(), [token.symbol])

    const fiatHumanAmount = BigNutils().toCurrencyConversion(isVTHO ? formattedTotalCost : amount, exchangeRate)

    return (
        <>
            <BaseSpacer height={24} />
            <BaseText typographyFont="subTitleBold">{LL.SEND_DETAILS()}</BaseText>

            <BaseSpacer height={12} />
            <BaseText typographyFont="caption">{LL.SEND_AMOUNT()}</BaseText>

            <BaseView flexDirection="row">
                {isVTHO ? (
                    <Animated.Text style={[baseStyles.coloredText, amountAanimatedStyle]}>
                        {formattedAmount}
                    </Animated.Text>
                ) : (
                    <BaseText typographyFont="subSubTitle">{formattedAmount}</BaseText>
                )}
                <BaseText typographyFont="bodyBold" mx={4}>
                    {symbol}
                </BaseText>

                {exchangeRate && !isVTHO && (
                    <FiatBalance typographyFont="buttonSecondary" balances={[fiatHumanAmount.value]} prefix="≈ " />
                )}
            </BaseView>

            {/* Show total tx cost if the token is VTHO and the gas fee is not delegated */}
            {isVTHO && !isDelegated ? (
                <>
                    <BaseSpacer height={12} />
                    <BaseText typographyFont="caption">{LL.SEND_TOTAL_COST()}</BaseText>
                    <BaseView flexDirection="row">
                        <Animated.Text style={[baseStyles.coloredText, totalTxAnimatedStyle]}>
                            {formattedTotalCost}
                        </Animated.Text>
                        <BaseText typographyFont="bodyBold" mx={4}>
                            {symbol}
                        </BaseText>

                        {exchangeRate && (
                            <FiatBalance
                                typographyFont="buttonSecondary"
                                balances={[fiatHumanAmount.value]}
                                prefix="≈ "
                            />
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
