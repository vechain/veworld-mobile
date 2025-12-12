import { useNavigation } from "@react-navigation/native"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import * as Haptics from "expo-haptics"
import Lottie from "lottie-react-native"
import React, { useCallback, useEffect, useMemo, useState } from "react"
import { StyleSheet } from "react-native"
import { BlePairingDark } from "~Assets"
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
    useInAppBrowser,
    useWalletConnect,
} from "~Components"
import { ERROR_EVENTS, LEDGER_ERROR_CODES } from "~Constants"
import { useBottomSheetModal, useLedgerDevice } from "~Hooks"
import { useExternalDappConnection } from "~Hooks/useExternalDappConnection"
import { useLoginSession } from "~Hooks/useLoginSession"
import { LoginActivityValue } from "~Model"
import { RootStackParamListSwitch, Routes } from "~Navigation"
import { addLoginActivity, addSession, addSignCertificateActivity, useAppDispatch } from "~Storage/Redux"
import { debug, error, HexUtils, LedgerUtils } from "~Utils"
import { useI18nContext } from "~i18n"

const MUTEX_TIMEOUT = 1000

type Props = NativeStackScreenProps<RootStackParamListSwitch, Routes.LEDGER_SIGN_CERTIFICATE>

enum SigningStep {
    CONNECTING,
    SIGNING,
    DONE,
}

export const LedgerSignCertificate: React.FC<Props> = ({ route }) => {
    const { accountWithDevice, request, certificate, keepMeLoggedIn } = route.params

    const { processRequest } = useWalletConnect()
    const { postMessage } = useInAppBrowser()
    const { createSessionIfNotExists } = useLoginSession()

    const { LL } = useI18nContext()
    const nav = useNavigation()

    const [userRejected, setUserRejected] = useState<boolean>(false)
    const [signature, setSignature] = useState<Buffer>()
    const [isAwaitingSignature, setIsAwaitingSignature] = useState(false)
    const [signingError, setSigningError] = useState<boolean>()
    const [isSending, setIsSending] = useState(false)
    const dispatch = useAppDispatch()

    const {
        ref: connectionErrorSheetRef,
        onOpen: openConnectionErrorSheet,
        onClose: closeConnectionErrorSheet,
    } = useBottomSheetModal()

    const {
        appOpen,
        errorCode,
        withTransport,
        disconnectLedger,
        stopPollingCorrectDeviceSettings,
        stopPollingDeviceStatus,
    } = useLedgerDevice({
        deviceId: accountWithDevice.device.deviceId,
    })

    const { onSuccess, onFailure, onRejectRequest } = useExternalDappConnection()

    useEffect(() => {
        if (errorCode) {
            openConnectionErrorSheet()
        }
    }, [openConnectionErrorSheet, errorCode])

    const ledgerErrorCode = useMemo(() => {
        if (
            errorCode === LEDGER_ERROR_CODES.CLAUSES_DISABLED ||
            errorCode === LEDGER_ERROR_CODES.CONTRACT_DISABLED ||
            errorCode === LEDGER_ERROR_CODES.CONTRACT_AND_CLAUSES_DISABLED
        ) {
            return undefined
        }
        if (isAwaitingSignature && !signingError) return LEDGER_ERROR_CODES.WAITING_SIGNATURE
        if (errorCode) return errorCode
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
                title: userRejected ? LL.CERT_LEDGER_REJECTED() : LL.CERT_LEDGER_SIGN_DATA(),
                subtitle: userRejected ? LL.CERT_LEDGER_REJECTED_SB() : LL.CERT_LEDGER_SIGN_DATA_SB(),
            },
        ],
        [LL, userRejected],
    )

    const currentStep = useMemo(() => {
        if (signature) return SigningStep.DONE

        if (!appOpen) return SigningStep.CONNECTING

        return SigningStep.SIGNING
    }, [appOpen, signature])

    const signCertificate = useCallback(async () => {
        try {
            if (!withTransport) return

            const res = await LedgerUtils.signCertificate(
                accountWithDevice.index,
                certificate,
                accountWithDevice.device,
                withTransport,
            )
            debug(ERROR_EVENTS.LEDGER, "Signature OK")

            if (res.success) {
                setSignature(res.payload)
            } else {
                if (res.err === LEDGER_ERROR_CODES.USER_REJECTED) {
                    setUserRejected(true)
                    if (request.type === "external-app") {
                        await onRejectRequest(request.redirectUrl)
                    }
                } else {
                    setSigningError(true)
                    if (request.type === "external-app") {
                        await onFailure(request.redirectUrl)
                    }
                }
            }
        } catch (e) {
            error(ERROR_EVENTS.LEDGER, e)
            setSigningError(true)
        } finally {
            setIsAwaitingSignature(false)
        }
    }, [accountWithDevice, certificate, withTransport, request, onRejectRequest, onFailure])

    /** Effects */

    /**
     * Sign the transaction when the device is connected and the clauses are enabled
     */
    useEffect(() => {
        if (!appOpen || userRejected) return
        stopPollingCorrectDeviceSettings()
        stopPollingDeviceStatus()
        // setTimeout is an hack to avoid mutex error
        setTimeout(() => signCertificate(), MUTEX_TIMEOUT)
    }, [userRejected, signCertificate, appOpen, stopPollingCorrectDeviceSettings, stopPollingDeviceStatus])

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

    const navigateOnFinish = useCallback(() => {
        // nav back to original screen
        nav.goBack()
    }, [nav])

    const handleOnConfirm = useCallback(async () => {
        try {
            if (!signature) return
            setIsSending(true)

            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)

            const certResponse: Connex.Vendor.CertResponse = {
                annex: {
                    domain: certificate.domain,
                    timestamp: certificate.timestamp,
                    signer: certificate.signer,
                },
                signature: HexUtils.addPrefix(signature.toString("hex")),
            }

            if (request.type === "wallet-connect") {
                await processRequest(request.requestEvent, certResponse)
            } else if (request.type === "external-app") {
                await onSuccess({
                    redirectUrl: request.redirectUrl,
                    data: certResponse,
                    publicKey: request.publicKey,
                })
            } else {
                postMessage({
                    id: request.id,
                    data: certResponse,
                    method: request.method,
                })
            }

            await disconnectLedger()

            if (request.method === "thor_signCertificate") {
                createSessionIfNotExists(request)
                dispatch(
                    addSignCertificateActivity(
                        request.appName,
                        certificate.domain,
                        certificate.payload.content,
                        certificate.purpose,
                    ),
                )
            } else if (request.method === "thor_connect") {
                dispatch(
                    addLoginActivity({
                        appUrl: request.appUrl,
                        ...({ kind: request.kind, value: request.value } as LoginActivityValue),
                    }),
                )
                if (request.external) {
                    dispatch(
                        addSession({
                            kind: "external",
                            url: request.appUrl,
                            address: certificate.signer.toLowerCase() ?? "",
                            genesisId: request.genesisId,
                            name: request.appName,
                        }),
                    )
                } else if (keepMeLoggedIn) {
                    dispatch(
                        addSession({
                            kind: "permanent",
                            url: request.appUrl,
                            genesisId: request.genesisId,
                            name: request.appName,
                        }),
                    )
                } else {
                    dispatch(
                        addSession({
                            kind: "temporary",
                            url: request.appUrl,
                            address: certificate.signer.toLowerCase() ?? "",
                            genesisId: request.genesisId,
                            name: request.appName,
                        }),
                    )
                }
            }

            navigateOnFinish()
        } catch (e) {
            error(ERROR_EVENTS.LEDGER, e)
            showErrorToast({
                text1: LL.ERROR(),
                text2: LL.ERROR_GENERIC_OPERATION(),
            })
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
        } finally {
            setIsSending(false)
        }
    }, [
        signature,
        certificate.domain,
        certificate.timestamp,
        certificate.signer,
        certificate.payload.content,
        certificate.purpose,
        request,
        disconnectLedger,
        navigateOnFinish,
        processRequest,
        onSuccess,
        postMessage,
        createSessionIfNotExists,
        dispatch,
        keepMeLoggedIn,
        LL,
    ])

    const handleOnRetry = useCallback(() => {
        // this will trigger the useEffect to sign the transaction again
        // setTimeout is an hack to avoid mutex error
        setTimeout(() => setUserRejected(false), MUTEX_TIMEOUT)
    }, [])

    const BottomButton = useCallback(() => {
        if (currentStep === SigningStep.SIGNING && userRejected) {
            return (
                <BaseButton
                    style={styles.button}
                    mx={24}
                    haptics="Light"
                    title={LL.BTN_RETRY()}
                    isLoading={isSending}
                    action={handleOnRetry}
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
    }, [currentStep, userRejected, LL, isSending, handleOnRetry, signature, handleOnConfirm])

    return (
        <BaseSafeArea grow={1}>
            <BackButtonHeader title={LL.SEND_LEDGER_TITLE()} beforeNavigating={disconnectLedger} />
            <BaseView alignItems="flex-start" flexGrow={1} flex={1} mx={20}>
                <BaseText typographyFont="title">{LL.SEND_LEDGER_TITLE()}</BaseText>
                <BaseText typographyFont="body" my={10}>
                    {LL.LEDGER_CERT_TITLE_SB()}
                </BaseText>
                <BaseSpacer height={20} />
                <Lottie source={BlePairingDark} autoPlay loop style={styles.lottie} />
                <BaseSpacer height={20} />
                <StepsProgressBar steps={Steps} currentStep={currentStep} isCurrentStepError={!!signingError} />
                <BaseSpacer height={96} />
                <BaseText typographyFont="bodyBold">
                    {Steps[currentStep]?.title || LL.LEDGER_CERTIFICATE_READ()}
                </BaseText>
                <BaseText typographyFont="body" mt={8}>
                    {Steps[currentStep]?.subtitle || LL.LEDGER_CERTIFICATE_READ_SB()}
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
