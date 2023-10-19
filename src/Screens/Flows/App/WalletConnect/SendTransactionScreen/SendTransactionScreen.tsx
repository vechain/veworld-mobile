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
    getRpcError,
    RequireUserPassword,
    showErrorToast,
    useWalletConnect,
} from "~Components"
import {
    addPendingDappTransactionActivity,
    selectSelectedAccount,
    selectSelectedNetwork,
    selectTokensWithInfo,
    selectVerifyContext,
    setIsAppLoading,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"
import { TransactionUtils, WalletConnectUtils } from "~Utils"
import { useAnalyticTracking, useTransactionScreen } from "~Hooks"
import { useI18nContext } from "~i18n"
import { RootStackParamListSwitch, Routes } from "~Navigation"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { useNavigation } from "@react-navigation/native"
import { ClausesCarousel } from "../../ActivityDetailsScreen/Components"
import { Transaction } from "thor-devkit"
import { TransactionDetails, UnknownAppMessage } from "~Screens"
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

    const dispatch = useAppDispatch()
    const { LL } = useI18nContext()
    const nav = useNavigation()
    const track = useAnalyticTracking()

    const { processRequest, failRequest } = useWalletConnect()

    const [isInvalidChecked, setInvalidChecked] = React.useState(false)

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

    const verifyContext = useAppSelector(state =>
        selectVerifyContext(state, topic),
    )

    const validConnectedApp = useMemo(() => {
        if (!verifyContext) return true

        return verifyContext.validation === "VALID"
    }, [verifyContext])

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
            await processRequest(requestEvent, {
                txid: id,
                signer: selectedAccount.address,
            })

            dispatch(addPendingDappTransactionActivity(transaction, name, url))

            onFinish(true)
        },
        [
            onFinish,
            url,
            requestEvent,
            processRequest,
            selectedAccount.address,
            dispatch,
            name,
        ],
    )

    const onTransactionFailure = useCallback(async () => {
        await failRequest(requestEvent, getRpcError("internal"))

        onFinish(false)
    }, [requestEvent, failRequest, onFinish])

    /**
     * Rejects the request and closes the modal
     */
    const onReject = useCallback(async () => {
        try {
            await failRequest(requestEvent, getRpcError("userRejectedRequest"))

            // refactor(Minimizer): issues with iOS 17 & Android when connecting to desktop DApp (https://github.com/vechainfoundation/veworld-mobile/issues/951)
            // MinimizerUtils.goBack()
        } catch (e) {
            showErrorToast({
                text1: LL.NOTIFICATION_wallet_connect_matching_error(),
            })
        } finally {
            nav.goBack()
        }
    }, [requestEvent, failRequest, LL, nav])

    const {
        Delegation,
        onSubmit,
        vthoBalance,
        selectedDelegationOption,
        isThereEnoughGas,
        vthoGasFee,
        continueNotAllowed,
        isLoading,
        isPasswordPromptOpen,
        handleClosePasswordModal,
        onPasswordSuccess,
    } = useTransactionScreen({
        clauses,
        onTransactionSuccess,
        onTransactionFailure,
        initialRoute: Routes.HOME,
        options,
        requestEvent,
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
                    {Delegation()}

                    <BaseSpacer height={44} />
                    <TransactionDetails
                        selectedDelegationOption={selectedDelegationOption}
                        vthoGas={vthoGasFee}
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

                    <BaseSpacer height={30} />

                    <UnknownAppMessage
                        verifyContext={verifyContext}
                        confirmed={isInvalidChecked}
                        setConfirmed={setInvalidChecked}
                    />
                </BaseView>

                <BaseSpacer height={40} />
                <BaseView style={styles.footer}>
                    <BaseButton
                        w={100}
                        haptics="Light"
                        title={LL.COMMON_BTN_SIGN_AND_SEND()}
                        action={onSubmit}
                        disabled={
                            isLoading ||
                            continueNotAllowed ||
                            (!validConnectedApp && !isInvalidChecked)
                        }
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

            <RequireUserPassword
                isOpen={isPasswordPromptOpen}
                onClose={handleClosePasswordModal}
                onSuccess={onPasswordSuccess}
            />
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
