import { NativeStackScreenProps } from "@react-navigation/native-stack"
import Lottie from "lottie-react-native"
import React, { useCallback, useEffect, useMemo, useState } from "react"
import { StyleSheet } from "react-native"
import { BlePairingDark } from "~Assets"
import { useBottomSheetModal, useLedger } from "~Hooks"
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
    RootStackParamListSwitch,
    Routes,
} from "~Navigation"
import { debug, error, LedgerUtils, WalletConnectResponseUtils } from "~Utils"
import { useI18nContext } from "~i18n"
import { useNavigation } from "@react-navigation/native"
import * as Haptics from "expo-haptics"
import { LEDGER_ERROR_CODES } from "~Constants"

type Props = NativeStackScreenProps<
    RootStackParamListSwitch & RootStackParamListDiscover,
    Routes.LEDGER_SIGN_CERTIFICATE
>

enum SigningStep {
    CONNECTING,
    SIGNING,
    DONE,
}

export const LedgerSignCertificate: React.FC<Props> = ({ route }) => {
    const { accountWithDevice, certificate, initialRoute, requestEvent } =
        route.params

    const { web3Wallet } = useWalletConnect()

    const { LL } = useI18nContext()
    const nav = useNavigation()

    const [userRejected, setUserRejected] = useState<boolean>(false)
    const [signature, setSignature] = useState<Buffer>()
    const [isAwaitingSignature, setIsAwaitingSignature] = useState(false)
    const [signingError, setSigningError] = useState<boolean>()
    const [isSending, setIsSending] = useState(false)

    const {
        ref: connectionErrorSheetRef,
        onOpen: openConnectionErrorSheet,
        onClose: closeConnectionErrorSheet,
    } = useBottomSheetModal()

    const { appOpen, errorCode, withTransport, removeLedger } = useLedger({
        deviceId: accountWithDevice.device.deviceId,
        autoConnect: true,
    })

    useEffect(() => {
        if (errorCode) {
            openConnectionErrorSheet()
        }
    }, [openConnectionErrorSheet, errorCode])

    const ledgerErrorCode = useMemo(() => {
        if (errorCode) return errorCode

        if (isAwaitingSignature && !signingError)
            return LEDGER_ERROR_CODES.WAITING_SIGNATURE
    }, [errorCode, isAwaitingSignature, signingError])

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
                isActiveText: LL.LEDGER_SIGNING(),
                isNextText: LL.LEDGER_SIGN_DATA(),
                isDoneText: LL.LEDGER_DATA_SIGNED(),
                progressPercentage: 75,
                title: LL.CERT_LEDGER_SIGN_DATA(),
                subtitle: LL.CERT_LEDGER_SIGN_DATA_SB(),
            },
        ],
        [LL],
    )

    const currentStep = useMemo(() => {
        if (signature) return SigningStep.DONE

        if (!appOpen) return SigningStep.CONNECTING

        return SigningStep.SIGNING
    }, [appOpen, signature])

    const signCertificate = useCallback(async () => {
        try {
            if (!withTransport) return

            const { success, payload } = await LedgerUtils.signCertificate(
                accountWithDevice.index,
                certificate,
                accountWithDevice.device,
                withTransport,
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
            error("LedgerSignCertificate:signCertificate", e)
            setSigningError(true)
        } finally {
            setIsAwaitingSignature(false)
        }
    }, [accountWithDevice, certificate, withTransport])

    /** Effects */

    /**
     * Sign the transaction when the device is connected and the clauses are enabled
     */
    useEffect(() => {
        if (!appOpen || userRejected) return
        signCertificate()
    }, [userRejected, signCertificate, appOpen])

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
        switch (initialRoute) {
            case Routes.DISCOVER:
                nav.navigate(Routes.DISCOVER)
                break
            case Routes.HOME:
            default:
                nav.navigate(Routes.HOME)
                break
        }
    }, [initialRoute, nav])

    const handleOnConfirm = useCallback(async () => {
        try {
            if (!signature) return
            setIsSending(true)

            await Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Success,
            )

            await WalletConnectResponseUtils.signMessageRequestSuccessResponse(
                {
                    request: requestEvent,
                    web3Wallet,
                    LL,
                },
                signature,
                certificate,
            )

            await removeLedger()

            // refactor(Minimizer): issues with iOS 17 & Android when connecting to desktop DApp (https://github.com/vechainfoundation/veworld-mobile/issues/951)
            // MinimizerUtils.goBack()

            navigateOnFinish()
        } catch (e) {
            error("LedgerSignCertificate:handleOnConfirm", e)
            showErrorToast(LL.ERROR(), LL.ERROR_GENERIC_OPERATION())
            await Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Error,
            )
        } finally {
            setIsSending(false)
        }
    }, [
        removeLedger,
        requestEvent,
        web3Wallet,
        LL,
        signature,
        certificate,
        navigateOnFinish,
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
        if (currentStep === SigningStep.SIGNING && userRejected) {
            return (
                <BaseButton
                    style={styles.button}
                    mx={24}
                    haptics="Light"
                    title={LL.BTN_RETRY()}
                    isLoading={isSending}
                    action={signCertificate}
                />
            )
        }

        if (currentStep === SigningStep.DONE) {
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
        signCertificate,
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
                    {LL.LEDGER_CERT_TITLE_SB()}
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
                    isCurrentStepError={!!signingError}
                />
                <BaseSpacer height={96} />
                <BaseText typographyFont="bodyBold">
                    {Steps[currentStep]?.title || LL.LEDGER_CERTIFICATE_READ()}
                </BaseText>
                <BaseText typographyFont="body" mt={8}>
                    {Steps[currentStep]?.subtitle ||
                        LL.LEDGER_CERTIFICATE_READ_SB()}
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
