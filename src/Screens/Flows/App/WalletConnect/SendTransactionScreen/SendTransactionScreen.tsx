import React, { FC, useCallback, useMemo } from "react"
import { StyleSheet } from "react-native"
import {
    AccountCard,
    BaseButton,
    BaseCard,
    BaseSafeArea,
    BaseSpacer,
    BaseText,
    BaseView,
    CloseModalButton,
    DelegationOptions,
    showErrorToast,
    useWalletConnect,
} from "~Components"
import {
    addPendingDappTransactionActivity,
    selectSelectedAccount,
    selectSelectedNetwork,
    selectTokensWithInfo,
    selectVthoTokenWithBalanceByAccount,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"
import {
    error,
    FormattingUtils,
    TransactionUtils,
    WalletConnectResponseUtils,
    WalletConnectUtils,
} from "~Utils"
import {
    useAnalyticTracking,
    useCheckIdentity,
    useSignTransaction,
    useTransaction,
} from "~Hooks"
import { AccountWithDevice, DEVICE_TYPE, LedgerAccountWithDevice } from "~Model"
import { getSdkError } from "@walletconnect/utils"
import { useI18nContext } from "~i18n"
import { sendTransaction } from "~Networking"
import { ScrollView } from "react-native-gesture-handler"
import { useDelegation } from "~Screens/Flows/App/SendScreen/04-TransactionSummarySendScreen/Hooks"
import { BigNumber } from "bignumber.js"
import { RootStackParamListSwitch, Routes } from "~Navigation"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { useNavigation } from "@react-navigation/native"
import { TransactionDetails } from "./Components"
import { ClausesCarousel } from "../../ActivityDetailsScreen/Components"
import { DelegationType } from "~Model/Delegation"
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
    const track = useAnalyticTracking()

    //TODO: leverage all of the 'options' passed from DApp

    const { topic } = WalletConnectUtils.getRequestEventAttributes(requestEvent)

    const { name, url } =
        WalletConnectUtils.getSessionRequestAttributes(sessionRequest)

    const { web3Wallet } = useWalletConnect()
    const network = useAppSelector(selectSelectedNetwork)
    const selectedAccount: AccountWithDevice = useAppSelector(
        selectSelectedAccount,
    )
    const { LL } = useI18nContext()
    const dispatch = useAppDispatch()
    const nav = useNavigation()

    const onClose = useCallback(() => {
        nav.goBack()
    }, [nav])

    // Decoding clauses
    const tokens = useAppSelector(selectTokensWithInfo)
    const clausesMetadata = TransactionUtils.interpretClauses(message, tokens)

    const clauses = useMemo(() => {
        return message.map(clause => ({
            to: clause.to,
            value: clause.value,
            data: clause.data || "0x",
        }))
    }, [message])

    const { createTransactionBody, gas, setGasPayer } = useTransaction({
        clauses,
        providedGas: options.gas,
        dependsOn: options.dependsOn,
    })

    const transactionBody = createTransactionBody()

    // Delegation
    const {
        setNoDelegation,
        setSelectedDelegationAccount,
        setSelectedDelegationUrl,
        selectedDelegationOption,
        selectedDelegationAccount,
        selectedDelegationUrl,
        isDelegated,
    } = useDelegation({
        transactionBody,
        providedUrl: options.delegator?.url,
        setGasPayer,
    })

    const { signTransaction, navigateToLedger } = useSignTransaction({
        transactionBody,
        onTXFinish: onClose,
        isDelegated,
        selectedDelegationAccount,
        selectedDelegationOption,
        selectedDelegationUrl,
        initialRoute: Routes.HOME,
    })

    // Check if there is enough gas
    const vtho = useAppSelector(state =>
        selectVthoTokenWithBalanceByAccount(
            state,
            selectedDelegationAccount?.address || selectedAccount.address,
        ),
    )
    const vthoBalance = useMemo(
        () =>
            FormattingUtils.scaleNumberDown(
                vtho.balance.balance,
                vtho.decimals,
                2,
            ),
        [vtho],
    )

    const vthoGas = useMemo(
        () =>
            FormattingUtils.convertToFiatBalance(
                gas?.gas?.toString() || "0",
                1,
                5,
            ),
        [gas],
    )

    const isThereEnoughGas = useMemo(() => {
        let leftVtho = new BigNumber(vthoBalance)
        return vthoGas && leftVtho.gte(vthoGas)
    }, [vthoGas, vthoBalance])

    /**
     * Rejects the request and closes the modal
     */
    const onReject = useCallback(async () => {
        if (requestEvent) {
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
            }
        }

        onClose()
    }, [requestEvent, web3Wallet, topic, LL, onClose])

    /**
     * Signs the transaction and sends it to the blockchain
     */
    const handleAccept = useCallback(
        async (password?: string) => {
            try {
                let tx = await signTransaction(password)

                if (!tx) return

                const txId = await sendTransaction(tx, network.currentUrl)

                await WalletConnectResponseUtils.transactionRequestSuccessResponse(
                    { request: requestEvent, web3Wallet, LL },
                    txId,
                    selectedAccount.address,
                    network,
                )

                dispatch(addPendingDappTransactionActivity(tx, name, url))
                track(AnalyticsEvent.DAPP_TX_SENT)
                // refactor(Minimizer): issues with iOS 17 & Android when connecting to desktop DApp (https://github.com/vechainfoundation/veworld-mobile/issues/951)
                // MinimizerUtils.goBack()
            } catch (e) {
                track(AnalyticsEvent.DAPP_TX_FAILED_TO_SEND)
                error(e)
                await WalletConnectResponseUtils.transactionRequestFailedResponse(
                    { request: requestEvent, web3Wallet, LL },
                )
            } finally {
                onClose()
            }
        },
        [
            signTransaction,
            network,
            requestEvent,
            web3Wallet,
            LL,
            selectedAccount.address,
            dispatch,
            name,
            url,
            track,
            onClose,
        ],
    )

    const {
        ConfirmIdentityBottomSheet,
        checkIdentityBeforeOpening,
        isBiometricsEmpty,
    } = useCheckIdentity({
        onIdentityConfirmed: handleAccept,
    })

    const onSubmit = useCallback(async () => {
        if (
            selectedAccount.device.type === DEVICE_TYPE.LEDGER &&
            selectedDelegationOption !== DelegationType.ACCOUNT
        ) {
            await navigateToLedger(selectedAccount as LedgerAccountWithDevice)
        } else {
            await checkIdentityBeforeOpening()
        }
    }, [
        selectedAccount,
        selectedDelegationOption,
        navigateToLedger,
        checkIdentityBeforeOpening,
    ])

    const onPressBack = useCallback(async () => {
        await onReject()
    }, [onReject])

    return (
        <BaseSafeArea>
            <ScrollView
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
                contentInsetAdjustmentBehavior="automatic"
                contentContainerStyle={[styles.scrollViewContainer]}
                style={styles.scrollView}>
                <CloseModalButton onPress={onPressBack} />

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
                    <DelegationOptions
                        setNoDelegation={setNoDelegation}
                        selectedDelegationOption={selectedDelegationOption}
                        setSelectedAccount={setSelectedDelegationAccount}
                        selectedAccount={selectedDelegationAccount}
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
                                <BaseText py={8}>
                                    {selectedDelegationUrl}
                                </BaseText>
                            </BaseCard>
                        </>
                    )}

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
                        disabled={
                            (!isThereEnoughGas && !isDelegated) ||
                            isBiometricsEmpty
                        }
                        isLoading={isBiometricsEmpty}
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
