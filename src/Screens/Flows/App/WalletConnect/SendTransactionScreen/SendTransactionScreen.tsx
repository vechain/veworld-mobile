import { useNavigation } from "@react-navigation/native"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import React, { FC, useCallback, useMemo, useRef, useState } from "react"
import { NativeScrollEvent, NativeSyntheticEvent, ScrollView, StyleSheet } from "react-native"
import { Transaction } from "thor-devkit"
import {
    AccountCard,
    BaseSafeArea,
    BaseSpacer,
    BaseText,
    BaseView,
    CloseModalButton,
    DelegationView,
    getRpcError,
    RequireUserPassword,
    SelectAccountBottomSheet,
    showErrorToast,
    SignAndReject,
    useInAppBrowser,
    useWalletConnect,
} from "~Components"
import { AnalyticsEvent, creteAnalyticsEvent, RequestMethods } from "~Constants"
import { useAnalyticTracking, useBottomSheetModal, useSetSelectedAccount, useTransactionScreen } from "~Hooks"
import { useI18nContext } from "~i18n"
import { AccountWithDevice, WatchedAccount } from "~Model"
import { RootStackParamListSwitch, Routes } from "~Navigation"
import { TransactionDetails, UnknownAppMessage } from "~Screens"
import {
    addPendingDappTransactionActivity,
    selectOfficialTokens,
    selectSelectedAccount,
    selectSelectedNetwork,
    selectVerifyContext,
    selectVisibleAccounts,
    setIsAppLoading,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"
import { TransactionUtils } from "~Utils"
import { ClausesCarousel } from "../../ActivityDetailsScreen/Components"

type Props = NativeStackScreenProps<RootStackParamListSwitch, Routes.CONNECTED_APP_SEND_TRANSACTION_SCREEN>

export const SendTransactionScreen: FC<Props> = ({ route }: Props) => {
    const { request, isInjectedWallet } = route.params

    const dispatch = useAppDispatch()
    const { LL } = useI18nContext()
    const nav = useNavigation()
    const track = useAnalyticTracking()

    const { processRequest, failRequest } = useWalletConnect()
    const { postMessage } = useInAppBrowser()

    const [isInvalidChecked, setInvalidChecked] = React.useState(false)

    const network = useAppSelector(selectSelectedNetwork)
    const selectedAccount = useAppSelector(selectSelectedAccount)
    const tokens = useAppSelector(selectOfficialTokens)

    const [isVisible, setIsVisible] = useState(true)
    const yOffset = useRef(0)

    const sessionContext = useAppSelector(state =>
        selectVerifyContext(state, request.type === "wallet-connect" ? request.session.topic : undefined),
    )

    const validConnectedApp = useMemo(() => {
        if (!sessionContext) return true

        return sessionContext.verifyContext.validation === "VALID"
    }, [sessionContext])

    const clausesMetadata = useMemo(
        () => TransactionUtils.interpretClauses(request.message, tokens),
        [request.message, tokens],
    )

    const clauses = useMemo(() => {
        return request.message.map(clause => ({
            to: clause.to,
            value: clause.value,
            data: clause.data || "0x",
        }))
    }, [request.message])

    const { onSetSelectedAccount } = useSetSelectedAccount()

    const visibleAccounts = useAppSelector(selectVisibleAccounts)

    const {
        ref: selectAccountBottomSheetRef,
        onOpen: openSelectAccountBottomSheet,
        onClose: closeSelectAccountBottonSheet,
    } = useBottomSheetModal()

    const setSelectedAccount = (account: AccountWithDevice | WatchedAccount) => {
        onSetSelectedAccount({ address: account.address })
    }

    const onAccountCardPress = useCallback(() => {
        if (!request.options.signer) {
            openSelectAccountBottomSheet()
        }
    }, [openSelectAccountBottomSheet, request.options.signer])

    const goBack = useCallback(() => {
        // Requires an extra goBack if it's the first request from the dapp
        if (request.type === "in-app" && request.isFirstRequest) nav.goBack()

        nav.goBack()
    }, [nav, request])

    const onFinish = useCallback(
        (sucess: boolean) => {
            if (sucess) {
                track(AnalyticsEvent.WALLET_OPERATION, {
                    ...creteAnalyticsEvent({
                        medium: AnalyticsEvent.DAPP,
                        signature: AnalyticsEvent.LOCAL,
                        network: network.name,
                        context: isInjectedWallet ? AnalyticsEvent.IN_APP : AnalyticsEvent.WALLET_CONNECT,
                        dappUrl: request.appUrl ?? request.appName,
                    }),
                })
            }

            dispatch(setIsAppLoading(false))
            goBack()
        },
        [dispatch, goBack, track, network.name, isInjectedWallet, request.appUrl, request.appName],
    )

    const onTransactionSuccess = useCallback(
        async (transaction: Transaction, id: string) => {
            if (request.type === "wallet-connect") {
                await processRequest(request.requestEvent, {
                    txid: id,
                    signer: selectedAccount.address,
                })
            } else {
                postMessage({
                    id: request.id,
                    data: {
                        txid: id,
                        signer: selectedAccount.address,
                    },
                    method: RequestMethods.REQUEST_TRANSACTION,
                })
            }

            dispatch(addPendingDappTransactionActivity(transaction, request.appName, request.appUrl))

            onFinish(true)
        },
        [request, processRequest, selectedAccount.address, postMessage, dispatch, onFinish],
    )

    const onTransactionFailure = useCallback(async () => {
        if (request.type === "wallet-connect") {
            await failRequest(request.requestEvent, getRpcError("internal"))
        } else {
            postMessage({
                id: request.id,
                error: "There was an error processing the transaction",
                method: RequestMethods.REQUEST_TRANSACTION,
            })
        }

        onFinish(false)
    }, [postMessage, request, failRequest, onFinish])

    /**
     * Rejects the request and closes the modal
     */
    const onReject = useCallback(async () => {
        try {
            if (request.type === "wallet-connect") {
                await failRequest(request.requestEvent, getRpcError("userRejectedRequest"))
            } else {
                postMessage({
                    id: request.id,
                    error: "User rejected the request",
                    method: RequestMethods.REQUEST_TRANSACTION,
                })
            }
        } catch (e) {
            showErrorToast({
                text1: LL.NOTIFICATION_wallet_connect_matching_error(),
            })
        } finally {
            goBack()
        }
    }, [request, failRequest, postMessage, goBack, LL])

    const {
        selectedDelegationOption,
        onSubmit,
        isPasswordPromptOpen,
        handleClosePasswordModal,
        onPasswordSuccess,
        resetDelegation,
        setSelectedDelegationAccount,
        setSelectedDelegationUrl,
        isEnoughGas,
        selectedDelegationAccount,
        selectedDelegationUrl,
        vtho,
        isDisabledButtonState,
        isLoading,
        priorityFees,
    } = useTransactionScreen({
        clauses,
        onTransactionSuccess,
        onTransactionFailure,
        dappRequest: request,
    })

    const handleScroll = useCallback(
        (e: NativeSyntheticEvent<NativeScrollEvent>) => {
            e.persist()
            if (e.nativeEvent.contentOffset) {
                const offsetY = e.nativeEvent.contentOffset.y
                const contentHeight = e.nativeEvent.contentSize.height
                const scrollViewHeight = e.nativeEvent.layoutMeasurement.height
                const maxOffset = contentHeight > scrollViewHeight ? contentHeight - scrollViewHeight - 10 : 0
                const isAtBottom = offsetY > maxOffset
                const shouldShow = offsetY <= yOffset.current || offsetY <= 0 || isAtBottom

                if (shouldShow !== isVisible) {
                    setIsVisible(shouldShow)
                }

                yOffset.current = offsetY
            }
        },
        [isVisible],
    )

    return (
        <BaseSafeArea>
            <ScrollView
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
                contentInsetAdjustmentBehavior="automatic"
                contentContainerStyle={[styles.scrollViewContainer]}
                onScroll={handleScroll}
                style={styles.scrollView}>
                <CloseModalButton onPress={onReject} />

                <BaseView mx={20} style={styles.alignLeft}>
                    <BaseText typographyFont="title">{LL.CONNECTED_APP_REQUEST()}</BaseText>

                    <BaseSpacer height={32} />
                    <BaseText typographyFont="subTitle">{LL.CONNECTED_APP_SIGN_TRANSACTION_REQUEST_TITLE()}</BaseText>
                    <BaseSpacer height={16} />
                    <BaseText>{LL.CONNECTED_APP_SIGN_TRANSACTION_REQUEST_DESCRIPTION()}</BaseText>
                </BaseView>

                <BaseSpacer height={24} />
                <BaseView mx={20}>
                    <BaseText typographyFont="subTitleBold">{LL.CONNECTED_APP_SELECTED_ACCOUNT_LABEL()}</BaseText>
                    <BaseSpacer height={16} />
                    <AccountCard
                        account={selectedAccount}
                        showOpacityWhenDisabled={false}
                        onPress={onAccountCardPress}
                    />
                </BaseView>

                <BaseSpacer height={24} />
                <BaseView mx={20}>
                    <DelegationView
                        setNoDelegation={resetDelegation}
                        selectedDelegationOption={selectedDelegationOption}
                        setSelectedDelegationAccount={setSelectedDelegationAccount}
                        selectedDelegationAccount={selectedDelegationAccount}
                        selectedDelegationUrl={selectedDelegationUrl}
                        setSelectedDelegationUrl={setSelectedDelegationUrl}
                    />

                    <BaseSpacer height={44} />
                    <TransactionDetails
                        selectedDelegationOption={selectedDelegationOption}
                        vthoGas={priorityFees.gasFee}
                        isThereEnoughGas={isEnoughGas || false}
                        vtho={vtho}
                        request={request}
                        network={network}
                        message={request.message}
                        options={request.options}
                    />

                    <BaseSpacer height={44} />
                    {!!clausesMetadata.length && <ClausesCarousel clausesMetadata={clausesMetadata} />}

                    <BaseSpacer height={30} />

                    {sessionContext && (
                        <UnknownAppMessage
                            verifyContext={sessionContext.verifyContext}
                            confirmed={isInvalidChecked}
                            setConfirmed={setInvalidChecked}
                        />
                    )}
                </BaseView>
                <BaseSpacer height={194} />
            </ScrollView>

            <SignAndReject
                isVisible={isVisible}
                onConfirmTitle={LL.COMMON_BTN_SIGN_AND_SEND()}
                onConfirm={onSubmit}
                confirmButtonDisabled={isLoading || isDisabledButtonState || (!validConnectedApp && !isInvalidChecked)}
                isConfirmLoading={isLoading}
                onRejectTitle={LL.COMMON_BTN_REJECT()}
                onReject={onReject}
            />

            <SelectAccountBottomSheet
                closeBottomSheet={closeSelectAccountBottonSheet}
                accounts={visibleAccounts}
                setSelectedAccount={setSelectedAccount}
                selectedAccount={selectedAccount}
                ref={selectAccountBottomSheetRef}
            />

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
