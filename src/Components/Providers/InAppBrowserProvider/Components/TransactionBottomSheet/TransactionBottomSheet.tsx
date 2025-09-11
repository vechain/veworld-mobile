import { BottomSheetScrollView } from "@gorhom/bottom-sheet"
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import { Transaction } from "@vechain/sdk-core"
import { ComponentProps, default as React, useCallback, useMemo, useRef, useState } from "react"
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
    addConnectedDiscoveryApp,
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
import { useExternalDappConnection } from "~Hooks/useExternalDappConnection"

type Props = {
    request: TransactionRequest
    onCancel: (request: TransactionRequest) => Promise<void>
    onTransactionSuccess: (transaction: Transaction, id: string) => Promise<void>
    onTransactionFailure: () => Promise<void>
    onNavigateToLedger: () => void
    selectAccountBsRef: React.RefObject<BottomSheetModalMethods>
} & Pick<ComponentProps<typeof TransactionDetails>, "onShowDetails">

export const TransactionBottomSheetContent = ({
    request,
    onCancel,
    selectAccountBsRef,
    onTransactionFailure,
    onTransactionSuccess,
    onNavigateToLedger,
    onShowDetails,
}: Props) => {
    const { LL } = useI18nContext()
    const { styles, theme } = useThemedStyles(baseStyles)

    const selectedAccount = useAppSelector(selectSelectedAccountOrNull)
    const visibleAccounts = useAppSelector(selectVisibleAccountsWithoutObserved)
    const { onClose: onCloseSelectAccountBs, onOpen: onOpenSelectAccountBs } = useBottomSheetModal({
        externalRef: selectAccountBsRef,
    })

    const { onSetSelectedAccount } = useSetSelectedAccount()

    const dispatch = useAppDispatch()

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
            comment: clause.comment,
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

    const onSign = useCallback(() => {
        dispatch(
            addConnectedDiscoveryApp({
                name: request.appName,
                href: new URL(request.appUrl).hostname,
                connectedTime: Date.now(),
            }),
        )
        return onSubmit()
    }, [dispatch, onSubmit, request.appName, request.appUrl])

    return (
        <>
            <BaseView
                flexDirection="row"
                gap={12}
                justifyContent="space-between"
                px={24}
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
                <TransactionDetails
                    request={request}
                    outputs={transactionOutputs}
                    clauses={clauses}
                    onShowDetails={onShowDetails}
                />
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

            <BaseView flexDirection="row" gap={16} mt={24} px={24} mb={16}>
                <BaseButton
                    action={onCancel.bind(null, request)}
                    variant="outline"
                    flex={1}
                    testID="SIGN_TRANSACTION_REQUEST_BTN_CANCEL">
                    {LL.COMMON_BTN_CANCEL()}
                </BaseButton>
                <BaseButton
                    action={onSign}
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
    const { onRejectRequest, onSuccess, onFailure } = useExternalDappConnection()

    const track = useAnalyticTracking()

    const { postMessage } = useInAppBrowser()

    const { failRequest, processRequest } = useWalletConnect()

    const selectedAccount = useAppSelector(selectSelectedAccountOrNull)

    const dispatch = useAppDispatch()

    const isUserAction = useRef(false)

    const [snapPoints, setSnapPoints] = useState(["75%"])

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
                    signer: selectedAccount.address,
                })
            } else if (transactionBsData.type === "external-app") {
                await onSuccess({
                    redirectUrl: transactionBsData.redirectUrl,
                    data: {
                        transaction,
                    },
                    publicKey: transactionBsData.publicKey,
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
        [transactionBsData, selectedAccount, dispatch, onFinish, processRequest, postMessage, onSuccess],
    )

    const onTransactionFailure = useCallback(async () => {
        assertDefined(transactionBsData)
        assertDefined(selectedAccount)
        if (transactionBsData.type === "wallet-connect") {
            await failRequest(transactionBsData.requestEvent, getRpcError("internal"))
        } else if (transactionBsData.type === "external-app") {
            await onFailure(transactionBsData.redirectUrl)
        } else {
            postMessage({
                id: transactionBsData.id,
                error: "There was an error processing the transaction",
                method: RequestMethods.REQUEST_TRANSACTION,
            })
        }

        onFinish(false)
    }, [transactionBsData, selectedAccount, onFinish, failRequest, postMessage, onFailure])

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
                } else if (request.type === "external-app") {
                    await onRejectRequest(request.redirectUrl)
                } else {
                    postMessage({
                        id: request.id,
                        error: "User rejected the request",
                        method: RequestMethods.REQUEST_TRANSACTION,
                    })
                }
            } catch {
                showErrorToast({
                    text1: LL.NOTIFICATION_wallet_connect_matching_error(),
                })
            }
        },
        [LL, failRequest, postMessage, onRejectRequest],
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
        if (isUserAction.current) {
            setTransactionBsData(null)
            setSnapPoints(["75%"])
            isUserAction.current = false
            return
        }
        if (!transactionBsData) return
        await rejectRequest(transactionBsData)
        setSnapPoints(["75%"])
        isUserAction.current = false
        setTransactionBsData(null)
    }, [rejectRequest, setTransactionBsData, transactionBsData])

    const onShowDetails = useCallback((newValue: boolean) => {
        if (newValue) setSnapPoints(["90%"])
        else setSnapPoints(["75%"])
    }, [])

    return (
        <BaseBottomSheet
            snapPoints={snapPoints}
            ref={transactionBsRef}
            onDismiss={onDismiss}
            enableContentPanningGesture={false}
            noMargins>
            {transactionBsData && (
                <TransactionBottomSheetContent
                    onCancel={onCancel}
                    request={transactionBsData}
                    selectAccountBsRef={selectAccountBsRef}
                    onTransactionFailure={onTransactionFailure}
                    onTransactionSuccess={onTransactionSuccess}
                    onNavigateToLedger={onNavigateToLedger}
                    onShowDetails={onShowDetails}
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
            paddingHorizontal: 24,
        },
    })
