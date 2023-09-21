import React, { useCallback, useMemo } from "react"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import {
    useAnalyticTracking,
    useTheme,
    useTransactionScreen,
    useTransferAddContact,
} from "~Hooks"
import { AddressUtils, FormattingUtils } from "~Utils"
import { AnalyticsEvent, COLORS } from "~Constants"
import {
    BaseSpacer,
    BaseText,
    BaseView,
    Layout,
    RequireUserPassword,
    TransferCard,
} from "~Components"
import {
    RootStackParamListDiscover,
    RootStackParamListHome,
    Routes,
} from "~Navigation"
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
import { ContactType, DEVICE_TYPE } from "~Model"
import { prepareFungibleClause } from "~Utils/TransactionUtils/TransactionUtils"
import { Transaction } from "thor-devkit"
import { ContactManagementBottomSheet } from "../../ContactsScreen"

type Props = NativeStackScreenProps<
    RootStackParamListHome & RootStackParamListDiscover,
    Routes.TRANSACTION_SUMMARY_SEND
>

export const TransactionSummarySendScreen = ({ route }: Props) => {
    const { token, amount, address, initialRoute } = route.params

    const { LL } = useI18nContext()
    const theme = useTheme()
    const dispatch = useAppDispatch()
    const track = useAnalyticTracking()
    const nav = useNavigation()

    // TODO (Vas) (https://github.com/vechainfoundation/veworld-mobile/issues/763) refactor to a new hook
    const account = useAppSelector(selectSelectedAccount)
    const currency = useAppSelector(selectCurrency)
    const exchangeRate = useAppSelector(state =>
        selectCurrencyExchangeRate(state, token),
    )
    const pendingTransaction = useAppSelector(state =>
        selectPendingTx(state, token.address),
    )

    const {
        onAddContactPress,
        handleSaveContact,
        addContactSheet,
        selectedContactAddress,
        closeAddContactSheet,
    } = useTransferAddContact()

    const formattedFiatAmount = useMemo(
        () =>
            FormattingUtils.humanNumber(
                FormattingUtils.convertToFiatBalance(
                    amount || "0",
                    exchangeRate?.rate || 1,
                    0,
                ),
                amount,
            ),
        [amount, exchangeRate],
    )

    const clauses = useMemo(
        () => prepareFungibleClause(amount, token, address),
        [amount, token, address],
    )

    const onFinish = useCallback(
        (success: boolean) => {
            if (success) track(AnalyticsEvent.SEND_FUNGIBLE_SENT)
            else track(AnalyticsEvent.SEND_FUNGIBLE_FAILED_TO_SEND)

            dispatch(setIsAppLoading(false))

            switch (initialRoute) {
                case Routes.DISCOVER:
                    nav.navigate(Routes.DISCOVER)
                    break
                case Routes.HOME:
                default:
                    nav.navigate(Routes.HOME)
                    break
            }
        },
        [track, dispatch, nav, initialRoute],
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

    const {
        isPasswordPromptOpen,
        handleClosePasswordModal,
        onPasswordSuccess,
        Delegation,
        RenderGas,
        SubmitButton,
    } = useTransactionScreen({
        clauses,
        onTransactionSuccess,
        onTransactionFailure,
        initialRoute: Routes.HOME,
    })

    const accounts = useAppSelector(selectAccounts)
    const receiverIsAccount = accounts.find(_account =>
        AddressUtils.compareAddresses(_account.address, address),
    )

    return (
        <Layout
            safeAreaTestID="Transaction_Summary_Send_Screen"
            title={LL.SEND_TOKEN_TITLE()}
            showSelectedNetwork
            noStaticBottomPadding
            body={
                <BaseView mb={80} mt={8}>
                    <TransferCard
                        fromAddress={account.address}
                        toAddresses={[address]}
                        onAddContactPress={onAddContactPress}
                        isFromAccountLedger={
                            account.device?.type === DEVICE_TYPE.LEDGER
                        }
                        isToAccountLedger={
                            receiverIsAccount?.device.type ===
                            DEVICE_TYPE.LEDGER
                        }
                    />
                    {!!pendingTransaction && (
                        <>
                            <BaseSpacer height={24} />

                            <BaseText color={COLORS.DARK_RED_ALERT}>
                                {LL.SEND_PENDING_TX_REVERT_ALERT()}
                            </BaseText>
                        </>
                    )}

                    <RequireUserPassword
                        isOpen={isPasswordPromptOpen}
                        onClose={handleClosePasswordModal}
                        onSuccess={onPasswordSuccess}
                    />

                    {Delegation()}

                    <BaseSpacer height={24} />
                    <BaseText typographyFont="subTitleBold">
                        {LL.SEND_DETAILS()}
                    </BaseText>
                    <BaseSpacer height={16} />
                    <BaseText typographyFont="buttonSecondary">
                        {LL.SEND_AMOUNT()}
                    </BaseText>
                    <BaseSpacer height={6} />
                    <BaseView flexDirection="row">
                        <BaseText typographyFont="subSubTitle">
                            {amount} {token.symbol}
                        </BaseText>
                        {exchangeRate && (
                            <BaseText typographyFont="buttonSecondary">
                                {" ≈ "}
                                {formattedFiatAmount} {currency}
                            </BaseText>
                        )}
                    </BaseView>
                    <BaseSpacer height={12} />
                    <BaseSpacer
                        height={0.5}
                        width={"100%"}
                        background={theme.colors.textDisabled}
                    />
                    <BaseSpacer height={12} />
                    <BaseText typographyFont="buttonSecondary">
                        {LL.SEND_GAS_FEE()}
                    </BaseText>
                    <BaseSpacer height={6} />

                    {RenderGas()}

                    <BaseSpacer height={12} />
                    <BaseSpacer
                        height={0.5}
                        width={"100%"}
                        background={theme.colors.textDisabled}
                    />
                    <BaseSpacer height={12} />
                    <BaseText typographyFont="buttonSecondary">
                        {LL.SEND_ESTIMATED_TIME()}
                    </BaseText>
                    <BaseSpacer height={6} />
                    <BaseText typographyFont="subSubTitle">
                        {LL.SEND_LESS_THAN_1_MIN()}
                    </BaseText>
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
                </BaseView>
            }
            footer={SubmitButton()}
        />
    )
}
