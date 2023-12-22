import { NativeStackScreenProps } from "@react-navigation/native-stack"
import Lottie from "lottie-react-native"
import React, { useCallback, useEffect, useMemo, useState } from "react"
import { StyleSheet } from "react-native"
import { BlePairingDark } from "~Assets"
import { useAnalyticTracking, useBottomSheetModal, useLedgerDevice, useSendTransaction } from "~Hooks"
import {
    BaseButton,
    BaseSpacer,
    BaseText,
    BaseView,
    BluetoothStatusBottomSheet,
    ConnectionErrorBottomSheet,
    Layout,
    showErrorToast,
    Step,
    StepsProgressBar,
    useWalletConnect,
} from "~Components"
import { RootStackParamListHome, RootStackParamListSwitch, Routes } from "~Navigation"
import {
    addPendingDappTransactionActivity,
    addPendingNFTtransferTransactionActivity,
    addPendingTransferTransactionActivity,
    setIsAppLoading,
    useAppDispatch,
} from "~Storage/Redux"
import { ActivityUtils, debug, error, LedgerUtils } from "~Utils"
import { useI18nContext } from "~i18n"
import { useNavigation } from "@react-navigation/native"
import * as Haptics from "expo-haptics"
import { AnalyticsEvent, ERROR_EVENTS, LEDGER_ERROR_CODES, RequestMethods } from "~Constants"
import { Buffer } from "buffer"
import { Transaction } from "thor-devkit"
import { ActivityType } from "~Model"
import { LedgerConfig } from "~Utils/LedgerUtils/LedgerUtils"
import { useInAppBrowser } from "~Components/Providers/InAppBrowserProvider"

type Props = NativeStackScreenProps<RootStackParamListHome & RootStackParamListSwitch, Routes.LEDGER_SIGN_TRANSACTION>

enum SignSteps {
    CONNECTING = 0,
    CHECKING = 1,
    SIGNING = 2,
    DONE = 3,
}

export const LedgerSignTransaction: React.FC<Props> = ({ route }) => {
    const { accountWithDevice, transaction, dappRequest, delegationSignature, initialRoute } = route.params

    const nav = useNavigation()
    const track = useAnalyticTracking()
    const { LL } = useI18nContext()
    const dispatch = useAppDispatch()
    const { processRequest } = useWalletConnect()
    const { postMessage } = useInAppBrowser()

    const [signature, setSignature] = useState<Buffer>()
    const [isAwaitingSignature, setIsAwaitingSignature] = useState(false)
    const [signingError, setSigningError] = useState<boolean>()
    const [isSending, setIsSending] = useState(false)
    const [userRejected, setUserRejected] = useState<boolean>(false)

    const {
        ref: connectionErrorSheetRef,
        onOpen: openConnectionErrorSheet,
        onClose: closeConnectionErrorSheet,
    } = useBottomSheetModal()

    const { appOpen, appConfig, errorCode, withTransport, disconnectLedger, startPollingCorrectDeviceSettings } =
        useLedgerDevice({
            deviceId: accountWithDevice.device.deviceId,
        })

    useEffect(() => {
        if (errorCode) {
            openConnectionErrorSheet()
        }
    }, [openConnectionErrorSheet, errorCode])

    const onTransactionSuccess = useCallback(
        (tx: Transaction) => {
            const activity = ActivityUtils.getActivityTypeFromClause(tx.body.clauses)

            track(AnalyticsEvent.LEDGER_TX_SENT)

            switch (activity) {
                case ActivityType.VET_TRANSFER:
                case ActivityType.FUNGIBLE_TOKEN:
                    dispatch(addPendingTransferTransactionActivity(tx))
                    track(AnalyticsEvent.SEND_FUNGIBLE_SENT, {
                        accountType: accountWithDevice.device.type,
                    })
                    break
                case ActivityType.NFT_TRANSFER:
                    track(AnalyticsEvent.SEND_NFT_SENT, {
                        accountType: accountWithDevice.device.type,
                    })
                    dispatch(addPendingNFTtransferTransactionActivity(tx))
                    break
                case ActivityType.DAPP_TRANSACTION:
                    track(AnalyticsEvent.DAPP_TX_SENT, {
                        accountType: accountWithDevice.device.type,
                    })

                    if (dappRequest) {
                        dispatch(addPendingDappTransactionActivity(tx, dappRequest.appName, dappRequest.appUrl))
                    }
            }
        },
        [track, dispatch, accountWithDevice, dappRequest],
    )

    const { sendTransaction } = useSendTransaction(onTransactionSuccess)

    // errorCode + validate signature
    const ledgerErrorCode = useMemo(() => {
        if (signature) return
        if (isAwaitingSignature && !signingError) return LEDGER_ERROR_CODES.WAITING_SIGNATURE
        if (errorCode) return errorCode
    }, [signature, errorCode, isAwaitingSignature, signingError])

    const Steps: Step[] = useMemo(
        () => [
            {
                isActiveText: LL.LEDGER_CONNECTING(),
                isNextText: LL.LEDGER_CONNECT(),
                isDoneText: LL.LEDGER_CONNECTED(),
                progressPercentage: 15,
                title: LL.SEND_LEDGER_CHECK_CONNECTION(),
                subtitle: LL.SEND_LEDGER_CHECK_CONNECTION_SB(),
            },
            {
                isActiveText: LL.LEDGER_CHECKING(),
                isNextText: LL.LEDGER_CHECK_STATUS(),
                isDoneText: LL.LEDGER_STATUS_OK(),
                progressPercentage: 50,
                title: LL.SEND_LEDGER_CHECK_CONNECTION(),
                subtitle: LL.SEND_LEDGER_CHECK_CONNECTION_SB(),
            },
            {
                isActiveText: LL.LEDGER_SIGNING(),
                isNextText: LL.LEDGER_SIGN_DATA(),
                isDoneText: LL.LEDGER_DATA_SIGNED(),
                progressPercentage: 85,
                title: userRejected ? LL.SEND_LEDGER_REJECTED_TRANSACTION() : LL.SEND_LEDGER_SIGN_DATA(),
                subtitle: userRejected ? LL.SEND_LEDGER_REJECTED_TRANSACTION_SB() : LL.SEND_LEDGER_SIGN_DATA_SB(),
            },
        ],
        [LL, userRejected],
    )

    const currentStep = useMemo(() => {
        // If we have the signature, we are done
        if (signature) return SignSteps.DONE

        if (!appOpen) return SignSteps.CONNECTING

        if (
            errorCode === LEDGER_ERROR_CODES.CONTRACT_AND_CLAUSES_DISABLED ||
            errorCode === LEDGER_ERROR_CODES.CONTRACT_DISABLED ||
            errorCode === LEDGER_ERROR_CODES.CLAUSES_DISABLED
        )
            return SignSteps.CHECKING

        return SignSteps.SIGNING
    }, [appOpen, signature, errorCode])

    const signTransaction = useCallback(async () => {
        try {
            if (!withTransport) return

            const res = await LedgerUtils.signTransaction(
                accountWithDevice.index,
                transaction,
                accountWithDevice.device,
                withTransport,
                () => setIsAwaitingSignature(true),
            )

            if (res.success) {
                setSignature(res.payload)
            } else {
                if (res.err === LEDGER_ERROR_CODES.USER_REJECTED) {
                    setUserRejected(true)
                } else {
                    setSigningError(true)
                }
            }
        } catch (e) {
            error(ERROR_EVENTS.LEDGER, e)
            setSigningError(true)
        } finally {
            setIsAwaitingSignature(false)
        }
    }, [accountWithDevice, withTransport, transaction])

    /** Effects */

    /**
     * Sign the transaction when the device is connected and the clauses are enabled
     */
    useEffect(() => {
        if (!userRejected && !signature && appOpen && appConfig === LedgerConfig.CLAUSE_AND_CONTRACT_ENABLED) {
            setSigningError(false)
            signTransaction()
        } else {
            debug(ERROR_EVENTS.LEDGER, "[LedgerSignTransaction] - skipping signTransaction")
            startPollingCorrectDeviceSettings()
        }
    }, [userRejected, appOpen, appConfig, signature, signTransaction, startPollingCorrectDeviceSettings])

    useEffect(() => {
        if (currentStep >= SignSteps.SIGNING) {
            setSigningError(false)
        }
    }, [currentStep])

    /**
     * Open the connection error sheet when the error code is not null
     */
    useEffect(() => {
        if (ledgerErrorCode) {
            openConnectionErrorSheet()
        } else {
            closeConnectionErrorSheet()
        }
    }, [ledgerErrorCode, closeConnectionErrorSheet, openConnectionErrorSheet])

    /** Effects */

    const navigateOnFinish = useCallback(() => {
        dispatch(setIsAppLoading(false))

        if (dappRequest) {
            // Requires an extra goBack if it's the first request from the dapp
            if (dappRequest.type === "in-app" && dappRequest.isFirstRequest) nav.goBack()

            // nav back to SendTransaction Screen
            nav.goBack()
            // nav back to original screen
            nav.goBack()
        } else {
            if (initialRoute) {
                nav.navigate(initialRoute)
            } else {
                nav.navigate(Routes.HOME)
            }
        }
    }, [initialRoute, dappRequest, dispatch, nav])

    const handleOnConfirm = useCallback(async () => {
        try {
            if (!signature) return
            setIsSending(true)

            dispatch(setIsAppLoading(true))

            transaction.signature = delegationSignature
                ? Buffer.concat([signature, Buffer.from(delegationSignature, "hex")])
                : signature

            const txId = await sendTransaction(transaction)
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)

            await disconnectLedger()

            //If DApp transaction

            if (dappRequest) {
                if (dappRequest.type === "wallet-connect") {
                    await processRequest(dappRequest.requestEvent, {
                        txid: txId,
                        signer: accountWithDevice.address,
                    })
                } else {
                    await postMessage({
                        id: dappRequest.id,
                        data: {
                            txid: txId,
                            signer: accountWithDevice.address,
                        },
                        method: RequestMethods.REQUEST_TRANSACTION,
                    })
                }
            }

            navigateOnFinish()
        } catch (e) {
            error(ERROR_EVENTS.LEDGER, e)
            showErrorToast({
                text1: LL.ERROR(),
                text2: LL.ERROR_GENERIC_OPERATION(),
            })
            track(AnalyticsEvent.LEDGER_TX_FAILED_TO_SEND)
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
            if (dappRequest) {
                nav.goBack()
            }
        } finally {
            setIsSending(false)
            dispatch(setIsAppLoading(false))
        }
    }, [
        track,
        signature,
        dispatch,
        transaction,
        delegationSignature,
        sendTransaction,
        disconnectLedger,
        dappRequest,
        postMessage,
        navigateOnFinish,
        LL,
        nav,
        accountWithDevice.address,
        processRequest,
    ])

    const handleOnRetry = useCallback(() => {
        startPollingCorrectDeviceSettings()
        // this will trigger the useEffect to sign the transaction again
        setUserRejected(false)
    }, [startPollingCorrectDeviceSettings])

    const BottomButton = useCallback(() => {
        if (currentStep === SignSteps.SIGNING && (userRejected || signingError)) {
            return (
                <BaseButton
                    mx={24}
                    haptics="Light"
                    title={LL.BTN_RETRY()}
                    isLoading={isSending}
                    action={handleOnRetry}
                />
            )
        }

        if (currentStep === SignSteps.DONE) {
            return (
                <BaseButton
                    mx={24}
                    haptics="Light"
                    title={LL.COMMON_BTN_CONFIRM()}
                    disabled={!signature || isSending}
                    isLoading={isSending}
                    action={handleOnConfirm}
                />
            )
        }

        return <></>
    }, [currentStep, userRejected, signingError, LL, isSending, handleOnRetry, signature, handleOnConfirm])

    return (
        <Layout
            beforeNavigating={disconnectLedger}
            body={
                <BaseView style={styles.container}>
                    <BaseText typographyFont="title">{LL.SEND_LEDGER_TITLE()}</BaseText>
                    <BaseText typographyFont="body" my={10}>
                        {LL.SEND_LEDGER_TITLE_SB()}
                    </BaseText>
                    <BaseSpacer height={20} />
                    <Lottie source={BlePairingDark} autoPlay loop style={styles.lottie} />
                    <BaseSpacer height={20} />
                    <StepsProgressBar
                        steps={Steps}
                        currentStep={currentStep}
                        isCurrentStepError={!signature && !!signingError}
                    />
                    <BaseSpacer height={96} />
                    <BaseText typographyFont="bodyBold">
                        {Steps[currentStep]?.title || LL.SEND_LEDGER_TX_READY()}
                    </BaseText>
                    <BaseText typographyFont="body" mt={8}>
                        {Steps[currentStep]?.subtitle || LL.SEND_LEDGER_TX_READY_SB()}
                    </BaseText>
                    <BluetoothStatusBottomSheet />
                    <ConnectionErrorBottomSheet
                        ref={connectionErrorSheetRef}
                        onDismiss={closeConnectionErrorSheet}
                        error={ledgerErrorCode}
                    />
                </BaseView>
            }
            footer={<BottomButton />}
        />
    )
}

const styles = StyleSheet.create({
    backIcon: { marginHorizontal: 20, alignSelf: "flex-start" },
    container: {
        width: "100%",
    },
    lottie: {
        width: "100%",
        height: 100,
    },
})
