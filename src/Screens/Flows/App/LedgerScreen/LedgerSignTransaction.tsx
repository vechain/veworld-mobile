import { NativeStackScreenProps } from "@react-navigation/native-stack"
import Lottie from "lottie-react-native"
import React, { useCallback, useEffect, useMemo, useState } from "react"
import { StyleSheet } from "react-native"
import { BlePairingDark } from "~Assets"
import {
    useAnalyticTracking,
    useBottomSheetModal,
    useLedger,
    useSendTransaction,
} from "~Hooks"
import {
    BackButtonHeader,
    BaseButton,
    BaseSafeArea,
    BaseSpacer,
    BaseText,
    BaseView,
    BluetoothStatusBottomSheet,
    ConnectionErrorBottomSheet,
    showErrorToast,
    Step,
    StepsProgressBar,
    useWalletConnect,
} from "~Components"
import {
    RootStackParamListDiscover,
    RootStackParamListHome,
    RootStackParamListSwitch,
    Routes,
} from "~Navigation"
import {
    addPendingDappTransactionActivity,
    addPendingNFTtransferTransactionActivity,
    addPendingTransferTransactionActivity,
    setIsAppLoading,
    useAppDispatch,
} from "~Storage/Redux"
import {
    ActivityUtils,
    debug,
    error,
    LedgerUtils,
    WalletConnectResponseUtils,
    WalletConnectUtils,
} from "~Utils"
import { useI18nContext } from "~i18n"
import { useNavigation } from "@react-navigation/native"
import * as Haptics from "expo-haptics"
import { AnalyticsEvent, LEDGER_ERROR_CODES } from "~Constants"
import { Buffer } from "buffer"
import { Transaction } from "thor-devkit"
import { ActivityType } from "~Model"
import { LedgerConfig } from "~Utils/LedgerUtils/LedgerUtils"

type Props = NativeStackScreenProps<
    RootStackParamListHome &
        RootStackParamListDiscover &
        RootStackParamListSwitch,
    Routes.LEDGER_SIGN_TRANSACTION
>

enum SignSteps {
    CONNECTING = 0,
    CHECKING = 1,
    SIGNING = 2,
    DONE = 3,
}

export const LedgerSignTransaction: React.FC<Props> = ({ route }) => {
    const {
        accountWithDevice,
        transaction,
        initialRoute,
        requestEvent,
        delegationSignature,
    } = route.params

    const nav = useNavigation()
    const track = useAnalyticTracking()
    const { LL } = useI18nContext()
    const dispatch = useAppDispatch()
    const { web3Wallet } = useWalletConnect()

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

    const { appOpen, appConfig, errorCode, withTransport, removeLedger } =
        useLedger({
            deviceId: accountWithDevice.device.deviceId,
        })

    useEffect(() => {
        if (errorCode) {
            openConnectionErrorSheet()
        }
    }, [openConnectionErrorSheet, errorCode])

    const onTransactionSuccess = useCallback(
        (tx: Transaction) => {
            const activity = ActivityUtils.getActivityTypeFromClause(
                tx.body.clauses,
            )

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

                    const { name, url } = WalletConnectUtils.getNameAndUrl(
                        web3Wallet,
                        requestEvent,
                    )

                    dispatch(addPendingDappTransactionActivity(tx, name, url))
            }
        },
        [track, dispatch, accountWithDevice, web3Wallet, requestEvent],
    )

    const { sendTransaction } = useSendTransaction(onTransactionSuccess)

    // errorCode + validate signature
    const ledgerErrorCode = useMemo(() => {
        if (signature) return

        if (errorCode) return errorCode

        if (isAwaitingSignature && !signingError)
            return LEDGER_ERROR_CODES.WAITING_SIGNATURE
    }, [signature, errorCode, isAwaitingSignature, signingError])

    const Steps: Step[] = useMemo(
        () => [
            {
                isActiveText: LL.LEDGER_CONNECTING(),
                isNextText: LL.LEDGER_CONNECT(),
                isDoneText: LL.LEDGER_CONNECTED(),
                progressPercentage: 25,
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
                progressPercentage: 75,
                title: LL.SEND_LEDGER_SIGN_DATA(),
                subtitle: LL.SEND_LEDGER_SIGN_DATA_SB(),
            },
        ],
        [LL],
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

            const { success, payload } = await LedgerUtils.signTransaction(
                accountWithDevice.index,
                transaction,
                accountWithDevice.device,
                withTransport,
                () => setIsAwaitingSignature(true),
            )
            debug("Signature OK")

            if (success) {
                setSignature(payload)
            } else {
                if (payload === LEDGER_ERROR_CODES.USER_REJECTED) {
                    setUserRejected(true)
                } else {
                    setSigningError(true)
                }
            }
        } catch (e) {
            error("LedgerSignTransaction:signTransaction", e)
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
        if (
            !userRejected &&
            !signature &&
            appOpen &&
            appConfig === LedgerConfig.CLAUSE_AND_CONTRACT_ENABLED
        ) {
            signTransaction()
        } else {
            debug("LedgerSignTransaction:signTransaction:skipped")
        }
    }, [userRejected, appOpen, appConfig, signature, signTransaction])

    /**
     * Open the connection error sheet when the error code is not null
     */
    useEffect(() => {
        debug({ ledgerErrorCode })
        if (ledgerErrorCode) {
            openConnectionErrorSheet()
        } else {
            closeConnectionErrorSheet()
        }
    }, [ledgerErrorCode, closeConnectionErrorSheet, openConnectionErrorSheet])

    /** Effects */

    const navigateOnFinish = useCallback(() => {
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
    }, [dispatch, initialRoute, nav])

    const handleOnConfirm = useCallback(async () => {
        try {
            if (!signature) return
            setIsSending(true)

            dispatch(setIsAppLoading(true))

            transaction.signature = delegationSignature
                ? Buffer.concat([
                      Buffer.from(delegationSignature, "hex"),
                      signature,
                  ])
                : signature

            const txId = await sendTransaction(transaction)
            await Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Success,
            )

            await removeLedger()

            //If DApp transaction
            if (requestEvent && web3Wallet) {
                await WalletConnectResponseUtils.transactionRequestSuccessResponse(
                    { request: requestEvent, web3Wallet, LL },
                    txId,
                    accountWithDevice.address,
                )

                // refactor(Minimizer): issues with iOS 17 & Android when connecting to desktop DApp (https://github.com/vechainfoundation/veworld-mobile/issues/951)
                // MinimizerUtils.goBack()
            }

            navigateOnFinish()
        } catch (e) {
            error("LedgerSignTransaction:handleOnConfirm", e)
            showErrorToast(LL.ERROR(), LL.ERROR_GENERIC_OPERATION())
            track(AnalyticsEvent.LEDGER_TX_FAILED_TO_SEND)
            await Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Error,
            )
            if (requestEvent && web3Wallet) {
                await WalletConnectResponseUtils.transactionRequestFailedResponse(
                    {
                        request: requestEvent,
                        web3Wallet,
                        LL,
                    },
                )

                // refactor(Minimizer): issues with iOS 17 & Android when connecting to desktop DApp (https://github.com/vechainfoundation/veworld-mobile/issues/951)
                // MinimizerUtils.goBack()
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
        removeLedger,
        requestEvent,
        web3Wallet,
        navigateOnFinish,
        LL,
        accountWithDevice.address,
    ])

    const beforeNavigatingBack = useCallback(async () => {
        await removeLedger()
        if (web3Wallet && requestEvent)
            await WalletConnectResponseUtils.userRejectedMethodsResponse({
                request: requestEvent,
                web3Wallet,
                LL,
            })
    }, [removeLedger, requestEvent, web3Wallet, LL])

    const BottomButton = useCallback(() => {
        if (currentStep === SignSteps.SIGNING && userRejected) {
            return (
                <BaseButton
                    style={styles.button}
                    mx={24}
                    haptics="Light"
                    title={LL.BTN_RETRY()}
                    isLoading={isSending}
                    action={signTransaction}
                />
            )
        }

        if (currentStep === SignSteps.DONE) {
            return (
                <BaseButton
                    style={styles.button}
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
    }, [
        currentStep,
        userRejected,
        isSending,
        LL,
        signTransaction,
        signature,
        handleOnConfirm,
    ])

    return (
        <BaseSafeArea grow={1}>
            <BackButtonHeader beforeNavigating={beforeNavigatingBack} />
            <BaseView alignItems="flex-start" flexGrow={1} flex={1} mx={20}>
                <BaseText typographyFont="title">
                    {LL.SEND_LEDGER_TITLE()}
                </BaseText>
                <BaseText typographyFont="body" my={10}>
                    {LL.SEND_LEDGER_TITLE_SB()}
                </BaseText>
                <BaseSpacer height={20} />
                <Lottie
                    source={BlePairingDark}
                    autoPlay
                    loop
                    style={styles.lottie}
                />
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
                    {Steps[currentStep]?.subtitle ||
                        LL.SEND_LEDGER_TX_READY_SB()}
                </BaseText>
            </BaseView>
            <BottomButton />
            <BluetoothStatusBottomSheet />
            <ConnectionErrorBottomSheet
                ref={connectionErrorSheetRef}
                onDismiss={closeConnectionErrorSheet}
                error={ledgerErrorCode}
            />
        </BaseSafeArea>
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
    button: {
        marginBottom: 70,
    },
})
