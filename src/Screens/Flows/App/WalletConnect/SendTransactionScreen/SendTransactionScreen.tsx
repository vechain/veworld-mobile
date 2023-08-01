import React, { FC, useCallback, useMemo } from "react"
import { ScrollView, StyleSheet } from "react-native"
import {
    AccountCard,
    BaseButton,
    BaseSafeArea,
    BaseSpacer,
    BaseText,
    BaseView,
    CloseModalButton,
    showErrorToast,
    useWalletConnect,
} from "~Components"
import {
    addPendingDappTransactionActivity,
    selectSelectedAccount,
    selectSelectedNetwork,
    selectTokensWithInfo,
    setIsAppLoading,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"
import {
    TransactionUtils,
    WalletConnectResponseUtils,
    WalletConnectUtils,
} from "~Utils"
import { useAnalyticTracking, useTransactionScreen } from "~Hooks"
import { getSdkError } from "@walletconnect/utils"
import { useI18nContext } from "~i18n"
import { RootStackParamListSwitch, Routes } from "~Navigation"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { useNavigation } from "@react-navigation/native"
import { ClausesCarousel } from "../../ActivityDetailsScreen/Components"
import { Transaction } from "thor-devkit"
import { TransactionDetails } from "~Screens"
import { AnalyticsEvent } from "~Constants"

type Props = NativeStackScreenProps<
    RootStackParamListSwitch,
    Routes.CONNECTED_APP_SEND_TRANSACTION_SCREEN
>

export const SendTransactionScreen: FC<Props> = ({ route }: Props) => {
    const {
        requestEvent,
        session: sessionRequest,
        message,
        options,
    } = route.params

    const { web3Wallet } = useWalletConnect()
    const dispatch = useAppDispatch()
    const { LL } = useI18nContext()
    const nav = useNavigation()
    const track = useAnalyticTracking()

    const network = useAppSelector(selectSelectedNetwork)
    const selectedAccount = useAppSelector(selectSelectedAccount)
    const tokens = useAppSelector(selectTokensWithInfo)

    const { topic } = useMemo(
        () => WalletConnectUtils.getRequestEventAttributes(requestEvent),
        [requestEvent],
    )

    const { name, url } = useMemo(
        () => WalletConnectUtils.getSessionRequestAttributes(sessionRequest),
        [sessionRequest],
    )

    const clausesMetadata = useMemo(
        () => TransactionUtils.interpretClauses(message, tokens),
        [message, tokens],
    )

    const clauses = useMemo(() => {
        return message.map(clause => ({
            to: clause.to,
            value: clause.value,
            data: clause.data || "0x",
        }))
    }, [message])

    const onFinish = useCallback(
        (sucess: boolean) => {
            if (sucess) track(AnalyticsEvent.DAPP_TX_SENT)
            else track(AnalyticsEvent.SEND_NFT_FAILED_TO_SEND)

            dispatch(setIsAppLoading(false))

            nav.goBack()
        },
        [nav, track, dispatch],
    )

    const onTransactionSuccess = useCallback(
        async (transaction: Transaction, id: string) => {
            await WalletConnectResponseUtils.transactionRequestSuccessResponse(
                { request: requestEvent, web3Wallet, LL },
                id,
                selectedAccount.address,
                network,
            )

            dispatch(addPendingDappTransactionActivity(transaction, name, url))

            onFinish(true)
        },
        [
            onFinish,
            url,
            requestEvent,
            web3Wallet,
            LL,
            selectedAccount.address,
            network,
            dispatch,
            name,
        ],
    )

    const onTransactionFailure = useCallback(async () => {
        await WalletConnectResponseUtils.transactionRequestFailedResponse({
            request: requestEvent,
            web3Wallet,
            LL,
        })

        onFinish(false)
    }, [requestEvent, web3Wallet, LL, onFinish])

    /**
     * Rejects the request and closes the modal
     */
    const onReject = useCallback(async () => {
        const { id } = requestEvent
        try {
            const response = WalletConnectUtils.formatJsonRpcError(
                id,
                getSdkError("USER_REJECTED_METHODS"),
            )

            await web3Wallet?.respondSessionRequest({
                topic,
                response,
            })

            // refactor(Minimizer): issues with iOS 17 & Android when connecting to desktop DApp (https://github.com/vechainfoundation/veworld-mobile/issues/951)
            // MinimizerUtils.goBack()
        } catch (e) {
            showErrorToast(LL.NOTIFICATION_wallet_connect_matching_error())
        } finally {
            nav.goBack()
        }
    }, [requestEvent, web3Wallet, topic, LL, nav])

    const {
        ConfirmIdentityBottomSheet,
        Delegation,
        onSubmit,
        vthoBalance,
        selectedDelegationOption,
        isThereEnoughGas,
        vthoGas,
        continueNotAllowed,
        isLoading,
    } = useTransactionScreen({
        clauses,
        onTransactionSuccess,
        onTransactionFailure,
        initialRoute: Routes.HOME,
        options,
    })

    return (
        <BaseSafeArea>
            <ScrollView
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
                contentInsetAdjustmentBehavior="automatic"
                contentContainerStyle={[styles.scrollViewContainer]}
                style={styles.scrollView}>
                <CloseModalButton onPress={onReject} />

                <BaseView mx={20} style={styles.alignLeft}>
                    <BaseText typographyFont="title">
                        {LL.CONNECTED_APP_REQUEST()}
                    </BaseText>

                    <BaseSpacer height={32} />
                    <BaseText typographyFont="subTitle">
                        {LL.CONNECTED_APP_SIGN_TRANSACTION_REQUEST_TITLE()}
                    </BaseText>
                    <BaseSpacer height={16} />
                    <BaseText>
                        {LL.CONNECTED_APP_SIGN_TRANSACTION_REQUEST_DESCRIPTION()}
                    </BaseText>
                </BaseView>

                <BaseSpacer height={24} />
                <BaseView mx={20}>
                    <BaseText typographyFont="subTitleBold">
                        {LL.CONNECTED_APP_SELECTED_ACCOUNT_LABEL()}
                    </BaseText>
                    <BaseSpacer height={16} />
                    <AccountCard
                        account={selectedAccount}
                        showOpacityWhenDisabled={false}
                    />
                </BaseView>

                <BaseSpacer height={24} />
                <BaseView mx={20}>
                    <Delegation />

                    <BaseSpacer height={44} />
                    <TransactionDetails
                        selectedDelegationOption={selectedDelegationOption}
                        vthoGas={vthoGas}
                        isThereEnoughGas={isThereEnoughGas || false}
                        vthoBalance={vthoBalance}
                        sessionRequest={sessionRequest}
                        network={network}
                        message={message}
                        options={options}
                    />

                    <BaseSpacer height={44} />
                    {!!clausesMetadata.length && (
                        <ClausesCarousel clausesMetadata={clausesMetadata} />
                    )}
                </BaseView>

                <BaseSpacer height={40} />
                <BaseView style={styles.footer}>
                    <BaseButton
                        w={100}
                        haptics="Light"
                        title={LL.COMMON_BTN_SIGN_AND_SEND()}
                        action={onSubmit}
                        disabled={isLoading || continueNotAllowed}
                        isLoading={isLoading}
                    />
                    <BaseSpacer height={16} />
                    <BaseButton
                        w={100}
                        haptics="Light"
                        variant="outline"
                        title={LL.COMMON_BTN_REJECT()}
                        action={onReject}
                    />
                </BaseView>

                <BaseSpacer height={16} />
            </ScrollView>

            <ConfirmIdentityBottomSheet />
        </BaseSafeArea>
    )
}

const styles = StyleSheet.create({
    alignLeft: {
        alignSelf: "flex-start",
    },
    scrollViewContainer: {
        width: "100%",
    },
    scrollView: {
        width: "100%",
    },
    footer: {
        width: "100%",
        alignItems: "center",
        paddingLeft: 20,
        paddingRight: 20,
    },
})
