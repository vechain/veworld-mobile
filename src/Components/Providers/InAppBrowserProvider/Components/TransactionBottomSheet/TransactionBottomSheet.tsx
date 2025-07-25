import { BottomSheetScrollView } from "@gorhom/bottom-sheet"
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import { Transaction } from "@vechain/sdk-core"
import { default as React, useCallback, useMemo, useRef, useState } from "react"
import { StyleSheet } from "react-native"
import { BaseBottomSheet, BaseButton, BaseIcon, BaseSpacer, BaseText, BaseView, showErrorToast } from "~Components/Base"
import { useInteraction } from "~Components/Providers/InteractionProvider"
import { getRpcError, useWalletConnect } from "~Components/Providers/WalletConnectProvider"
import { DelegationView, GasFeeSpeed, RequireUserPassword, SelectAccountBottomSheet } from "~Components/Reusable"
import { AccountSelector } from "~Components/Reusable/AccountSelector"
import { AnalyticsEvent, creteAnalyticsEvent, RequestMethods } from "~Constants"
import {
    useAnalyticTracking,
    useBottomSheetModal,
    useSetSelectedAccount,
    useThemedStyles,
    useTransactionScreen,
} from "~Hooks"
import { TransactionRequest } from "~Model"
import {
    addPendingDappTransactionActivity,
    selectSelectedAccountOrNull,
    selectSelectedNetwork,
    selectVerifyContext,
    selectVisibleAccountsWithoutObserved,
    setIsAppLoading,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"
import { AccountUtils } from "~Utils"
import { assertDefined } from "~Utils/TypeUtils"
import { useI18nContext } from "~i18n"
import { useInAppBrowser } from "../../InAppBrowserProvider"
import { TransactionDetails } from "./TransactionDetails"
type Props = {
    request: TransactionRequest
    onCancel: (request: TransactionRequest) => Promise<void>
    onTransactionSuccess: (transaction: Transaction, id: string) => Promise<void>
    onTransactionFailure: () => Promise<void>
    onNavigateToLedger: () => void
    selectAccountBsRef: React.RefObject<BottomSheetModalMethods>

    isLoading: boolean
}

export const TransactionBottomSheetContent = ({
    request,
    onCancel,
    selectAccountBsRef,
    onTransactionFailure,
    onTransactionSuccess,
    onNavigateToLedger,
}: Props) => {
    const { LL } = useI18nContext()
    const { styles, theme } = useThemedStyles(baseStyles)

    const selectedAccount = useAppSelector(selectSelectedAccountOrNull)
    const visibleAccounts = useAppSelector(selectVisibleAccountsWithoutObserved)
    const { onClose: onCloseSelectAccountBs, onOpen: onOpenSelectAccountBs } = useBottomSheetModal({
        externalRef: selectAccountBsRef,
    })

    const { onSetSelectedAccount } = useSetSelectedAccount()

    const sessionContext = useAppSelector(state =>
        selectVerifyContext(state, request.type === "wallet-connect" ? request.session.topic : undefined),
    )

    const validConnectedApp = useMemo(() => {
        if (!sessionContext) return true

        return sessionContext.verifyContext.validation === "VALID"
    }, [sessionContext])

    const onChangeAccountPress = useCallback(() => {
        onOpenSelectAccountBs()
    }, [onOpenSelectAccountBs])

    const clauses = useMemo(() => {
        return request.message.map(clause => ({
            to: clause.to,
            value: clause.value,
            data: clause.data || "0x",
        }))
    }, [request.message])

    const {
        selectedDelegationOption,
        onSubmit,
        isPasswordPromptOpen,
        handleClosePasswordModal,
        onPasswordSuccess,
        resetDelegation,
        setSelectedDelegationAccount,
        setSelectedDelegationUrl,
        selectedDelegationAccount,
        selectedDelegationUrl,
        isDisabledButtonState,
        isLoading,
        gasOptions,
        gasUpdatedAt,
        selectedFeeOption,
        setSelectedFeeOption,
        isGalactica,
        isBaseFeeRampingUp,
        speedChangeEnabled,
        isEnoughGas,
        availableTokens,
        selectedDelegationToken,
        setSelectedDelegationToken,
        hasEnoughBalanceOnAny,
        isFirstTimeLoadingFees,
        hasEnoughBalanceOnToken,
        isBiometricsEmpty,
        transactionOutputs,
    } = useTransactionScreen({
        clauses,
        onTransactionSuccess,
        onTransactionFailure,
        dappRequest: request,
        onNavigateToLedger,
    })

    return (
        <>
            <BaseView
                flexDirection="row"
                gap={12}
                justifyContent="space-between"
                testID="SIGN_TRANSACTION_REQUEST_TITLE">
                <BaseView flex={1} flexDirection="row" gap={12}>
                    <BaseIcon name="icon-apps" size={20} color={theme.colors.editSpeedBs.title} />
                    <BaseText typographyFont="subTitleSemiBold" color={theme.colors.editSpeedBs.title}>
                        {LL.SIGN_TRANSACTION_REQUEST_TITLE()}
                    </BaseText>
                </BaseView>
                {selectedAccount && (
                    <AccountSelector
                        account={selectedAccount}
                        variant="short"
                        changeable={!request.options.signer}
                        onPress={onChangeAccountPress}
                    />
                )}
            </BaseView>
            <BaseSpacer height={12} />
            <BottomSheetScrollView style={styles.scrollView}>
                <TransactionDetails request={request} outputs={transactionOutputs} clauses={clauses} />
                <BaseSpacer height={12} />
                <GasFeeSpeed
                    gasUpdatedAt={gasUpdatedAt}
                    options={gasOptions}
                    selectedFeeOption={selectedFeeOption}
                    setSelectedFeeOption={setSelectedFeeOption}
                    isGalactica={isGalactica}
                    isBaseFeeRampingUp={isBaseFeeRampingUp}
                    speedChangeEnabled={speedChangeEnabled}
                    isEnoughBalance={isEnoughGas}
                    availableDelegationTokens={availableTokens}
                    delegationToken={selectedDelegationToken}
                    setDelegationToken={setSelectedDelegationToken}
                    hasEnoughBalanceOnAny={hasEnoughBalanceOnAny}
                    isFirstTimeLoadingFees={isFirstTimeLoadingFees}
                    hasEnoughBalanceOnToken={hasEnoughBalanceOnToken}
                    containerStyle={styles.gasFeeSpeedContainer}>
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
            </BottomSheetScrollView>

            <BaseView flexDirection="row" gap={16} mt={24}>
                <BaseButton
                    action={onCancel.bind(null, request)}
                    variant="outline"
                    flex={1}
                    testID="SIGN_TRANSACTION_REQUEST_BTN_CANCEL">
                    {LL.COMMON_BTN_CANCEL()}
                </BaseButton>
                <BaseButton
                    action={onSubmit}
                    flex={1}
                    disabled={
                        AccountUtils.isObservedAccount(selectedAccount) ||
                        isBiometricsEmpty ||
                        !validConnectedApp ||
                        isLoading ||
                        !selectedAccount ||
                        isDisabledButtonState
                    }
                    isLoading={isLoading}
                    testID="SIGN_TRANSACTION_REQUEST_BTN_SIGN">
                    {LL.SIGN_TRANSACTION_REQUEST_CTA()}
                </BaseButton>
            </BaseView>

            <SelectAccountBottomSheet
                closeBottomSheet={onCloseSelectAccountBs}
                accounts={visibleAccounts}
                setSelectedAccount={onSetSelectedAccount}
                selectedAccount={selectedAccount}
                ref={selectAccountBsRef}
                cardVersion="v2"
            />
            <RequireUserPassword
                isOpen={isPasswordPromptOpen}
                onClose={handleClosePasswordModal}
                onSuccess={onPasswordSuccess}
            />
        </>
    )
}

export const TransactionBottomSheet = () => {
    const { LL } = useI18nContext()
    const { transactionBsRef, transactionBsData, setTransactionBsData } = useInteraction()
    const { onClose: onCloseBs } = useBottomSheetModal({ externalRef: transactionBsRef })
    const { ref: selectAccountBsRef } = useBottomSheetModal()
    const network = useAppSelector(selectSelectedNetwork)

    const track = useAnalyticTracking()

    const { postMessage } = useInAppBrowser()

    const { failRequest, processRequest } = useWalletConnect()

    const selectedAccount = useAppSelector(selectSelectedAccountOrNull)

    const dispatch = useAppDispatch()

    const isUserAction = useRef(false)

    const [isLoading, setIsLoading] = useState(false)

    const onFinish = useCallback(
        (success: boolean) => {
            assertDefined(transactionBsData)
            if (success) {
                track(AnalyticsEvent.WALLET_OPERATION, {
                    ...creteAnalyticsEvent({
                        medium: AnalyticsEvent.DAPP,
                        signature: AnalyticsEvent.LOCAL,
                        network: network.name,
                        context:
                            transactionBsData.type === "in-app" ? AnalyticsEvent.IN_APP : AnalyticsEvent.WALLET_CONNECT,
                        dappUrl: transactionBsData.appUrl ?? transactionBsData.appName,
                    }),
                })
            }

            isUserAction.current = true
            dispatch(setIsAppLoading(false))
            onCloseBs()
        },
        [transactionBsData, dispatch, onCloseBs, track, network.name],
    )

    const onTransactionSuccess = useCallback(
        async (transaction: Transaction, id: string) => {
            assertDefined(transactionBsData)
            assertDefined(selectedAccount)
            if (transactionBsData.type === "wallet-connect") {
                await processRequest(transactionBsData.requestEvent, {
                    txid: id,
                    signer: selectedAccount!.address,
                })
            } else {
                postMessage({
                    id: transactionBsData.id,
                    data: {
                        txid: id,
                        signer: selectedAccount.address,
                    },
                    method: RequestMethods.REQUEST_TRANSACTION,
                })
            }

            dispatch(
                addPendingDappTransactionActivity(transaction, transactionBsData.appName, transactionBsData.appUrl),
            )

            onFinish(true)
        },
        [transactionBsData, selectedAccount, dispatch, onFinish, processRequest, postMessage],
    )

    const onTransactionFailure = useCallback(async () => {
        assertDefined(transactionBsData)
        assertDefined(selectedAccount)
        if (transactionBsData.type === "wallet-connect") {
            await failRequest(transactionBsData.requestEvent, getRpcError("internal"))
        } else {
            postMessage({
                id: transactionBsData.id,
                error: "There was an error processing the transaction",
                method: RequestMethods.REQUEST_TRANSACTION,
            })
        }

        onFinish(false)
    }, [transactionBsData, selectedAccount, onFinish, failRequest, postMessage])

    const onNavigateToLedger = useCallback(() => {
        // Do not reject request if it's a ledger request
        isUserAction.current = true
        onCloseBs()
    }, [onCloseBs])

    const rejectRequest = useCallback(
        async (request: TransactionRequest) => {
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
            }
        },
        [LL, failRequest, postMessage],
    )

    const onCancel = useCallback(
        async (request: TransactionRequest) => {
            await rejectRequest(request)
            isUserAction.current = true
            onCloseBs()
        },
        [onCloseBs, rejectRequest],
    )

    const onDismiss = useCallback(async () => {
        try {
            if (isUserAction.current) {
                setTransactionBsData(null)
                isUserAction.current = false
                return
            }
            if (!transactionBsData) return
            await rejectRequest(transactionBsData)
            isUserAction.current = false
            setTransactionBsData(null)
        } finally {
            setIsLoading(false)
        }
    }, [rejectRequest, setTransactionBsData, transactionBsData])

    const snapPoints = useMemo(() => ["80%", "90%"], [])

    return (
        <BaseBottomSheet snapPoints={snapPoints} ref={transactionBsRef} onDismiss={onDismiss}>
            {transactionBsData && (
                <TransactionBottomSheetContent
                    onCancel={onCancel}
                    request={transactionBsData}
                    isLoading={isLoading}
                    selectAccountBsRef={selectAccountBsRef}
                    onTransactionFailure={onTransactionFailure}
                    onTransactionSuccess={onTransactionSuccess}
                    onNavigateToLedger={onNavigateToLedger}
                />
            )}
        </BaseBottomSheet>
    )
}

const baseStyles = () =>
    StyleSheet.create({
        gasFeeSpeedContainer: {
            marginTop: 0,
        },
        scrollView: {
            flex: 1,
        },
    })
