import React, { useCallback, useMemo } from "react"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { StyleSheet } from "react-native"
import { useAnalyticTracking, useTheme, useTransactionScreen } from "~Hooks"
import { AddressUtils, FormattingUtils } from "~Utils"
import { AnalyticsEvent, COLORS } from "~Constants"
import {
    AccountIcon,
    BaseCardGroup,
    BaseIcon,
    BaseSpacer,
    BaseText,
    BaseView,
    Layout,
    LedgerBadge,
    RequireUserPassword,
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
    selectKnownContacts,
    selectPendingTx,
    selectSelectedAccount,
    setIsAppLoading,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"
import { useI18nContext } from "~i18n"
import { useNavigation } from "@react-navigation/native"
import { DEVICE_TYPE } from "~Model"
import { prepareFungibleClause } from "~Utils/TransactionUtils/TransactionUtils"
import { Transaction } from "thor-devkit"

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
    const accounts = useAppSelector(selectAccounts)
    const contacts = useAppSelector(selectKnownContacts)
    const account = useAppSelector(selectSelectedAccount)
    const currency = useAppSelector(selectCurrency)
    const exchangeRate = useAppSelector(state =>
        selectCurrencyExchangeRate(state, token.symbol),
    )
    const pendingTransaction = useAppSelector(state =>
        selectPendingTx(state, token.address),
    )

    const accountsAndContacts = useMemo(
        () => [...accounts, ...contacts],
        [accounts, contacts],
    )

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

    const ReceiverDetails = () => {
        const receiverExists = accountsAndContacts.find(_account =>
            AddressUtils.compareAddresses(_account.address, address),
        )

        const receiverIsAccount = accounts.find(_account =>
            AddressUtils.compareAddresses(_account.address, address),
        )

        if (receiverExists)
            return (
                <BaseView>
                    <BaseText typographyFont="subSubTitle">
                        {receiverExists.alias}
                    </BaseText>
                    <BaseView flexDirection="row" mt={3}>
                        {receiverIsAccount?.device.type ===
                            DEVICE_TYPE.LEDGER && (
                            <LedgerBadge //eslint-disable-next-line react-native/no-inline-styles
                                containerStyle={{
                                    mr: 8,
                                }}
                            />
                        )}
                        <BaseText typographyFont="captionRegular">
                            {FormattingUtils.humanAddress(
                                receiverExists.address || "",
                            )}
                        </BaseText>
                    </BaseView>
                </BaseView>
            )

        return (
            <BaseView>
                <BaseText typographyFont="subSubTitle">
                    {FormattingUtils.humanAddress(address)}
                </BaseText>
            </BaseView>
        )
    }

    return (
        <Layout
            safeAreaTestID="Transaction_Summary_Send_Screen"
            title={LL.SEND_TOKEN_TITLE()}
            body={
                <BaseView mb={80} mt={8}>
                    {/* TODO (Vas) (https://github.com/vechainfoundation/veworld-mobile/issues/767) CHange BaseCardGroup with TransferCard */}
                    <BaseCardGroup
                        views={[
                            {
                                children: (
                                    <BaseView
                                        flex={1}
                                        style={styles.addressContainer}
                                        alignItems="flex-start">
                                        <BaseText typographyFont="captionBold">
                                            {LL.SEND_FROM()}
                                        </BaseText>
                                        <BaseSpacer height={8} />
                                        <BaseView flexDirection="row">
                                            <AccountIcon
                                                address={account.address}
                                            />
                                            <BaseSpacer width={8} />
                                            <BaseView>
                                                <BaseText typographyFont="subSubTitle">
                                                    {account.alias}
                                                </BaseText>
                                                <BaseView
                                                    flexDirection="row"
                                                    mt={3}>
                                                    {account.device?.type ===
                                                        DEVICE_TYPE.LEDGER && (
                                                        <LedgerBadge
                                                            //eslint-disable-next-line react-native/no-inline-styles
                                                            containerStyle={{
                                                                mr: 8,
                                                            }}
                                                        />
                                                    )}
                                                    <BaseText typographyFont="captionRegular">
                                                        {FormattingUtils.humanAddress(
                                                            account.address,
                                                        )}
                                                    </BaseText>
                                                </BaseView>
                                            </BaseView>
                                        </BaseView>
                                        <BaseIcon
                                            name={"arrow-down"}
                                            size={20}
                                            color={COLORS.WHITE}
                                            bg={COLORS.DARK_PURPLE_DISABLED}
                                            style={styles.icon}
                                        />
                                    </BaseView>
                                ),
                                style: styles.addressView,
                            },
                            {
                                children: (
                                    <BaseView flex={1} alignItems="flex-start">
                                        <BaseText typographyFont="captionBold">
                                            {LL.SEND_TO()}
                                        </BaseText>
                                        <BaseSpacer height={8} />
                                        <BaseView flexDirection="row">
                                            <AccountIcon address={address} />
                                            <BaseSpacer width={8} />
                                            <ReceiverDetails />
                                        </BaseView>
                                    </BaseView>
                                ),
                            },
                        ]}
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

                    <Delegation />

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

                    <RenderGas />

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
                </BaseView>
            }
            footer={<SubmitButton />}
        />
    )
}

const styles = StyleSheet.create({
    icon: {
        position: "absolute",
        right: 16,
        bottom: -32,
        padding: 8,
    },
    nextButton: {
        marginBottom: 70,
    },
    addressContainer: {
        overflow: "visible",
    },
    addressView: {
        zIndex: 2,
    },
})
