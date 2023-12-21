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
import { RootStackParamListSwitch, Routes } from "~Navigation"
import { error, HexUtils, LedgerUtils, SignMessageUtils, warn } from "~Utils"
import { useI18nContext } from "~i18n"
import { useNavigation } from "@react-navigation/native"
import * as Haptics from "expo-haptics"
import { ERROR_EVENTS, LEDGER_ERROR_CODES } from "~Constants"
import { compareAddresses } from "~Utils/AddressUtils/AddressUtils"

type Props = NativeStackScreenProps<RootStackParamListSwitch, Routes.LEDGER_SIGN_MESSAGE>

enum SigningStep {
    CONNECTING,
    SIGNING,
    DONE,
}

export const LedgerSignMessage: React.FC<Props> = ({ route }) => {
    const { accountWithDevice, message, requestEvent } = route.params

    const { processRequest } = useWalletConnect()

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

    const utfMessage = useMemo(() => {
        try {
            return Buffer.from(HexUtils.removePrefix(message), "hex").toString()
        } catch (e) {
            warn(ERROR_EVENTS.LEDGER, "SignMessageScreen: utfMessage", e)
            return message
        }
    }, [message])

    const { appOpen, errorCode, withTransport, removeLedger } = useLedger({
        deviceId: accountWithDevice.device.deviceId,
    })

    useEffect(() => {
        if (errorCode) {
            openConnectionErrorSheet()
        }
    }, [openConnectionErrorSheet, errorCode])

    const ledgerErrorCode = useMemo(() => {
        if (errorCode) return errorCode

        if (isAwaitingSignature && !signingError) return LEDGER_ERROR_CODES.WAITING_SIGNATURE
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
                title: userRejected ? LL.MESSAGE_LEDGER_REJECTED() : LL.MESSAGE_LEDGER_SIGN_DATA(),
                subtitle: userRejected ? LL.MESSAGE_LEDGER_REJECTED_SB() : LL.MESSAGE_LEDGER_SIGN_DATA_SB(),
            },
        ],
        [LL, userRejected],
    )

    const currentStep = useMemo(() => {
        if (signature) return SigningStep.DONE

        if (!appOpen) return SigningStep.CONNECTING

        return SigningStep.SIGNING
    }, [appOpen, signature])

    const signMessage = useCallback(async () => {
        try {
            if (!withTransport) return

            const _message = utfMessage

            const res = await LedgerUtils.signMessage({
                index: accountWithDevice.index,
                message: Buffer.from(_message),
                device: accountWithDevice.device,
                withTransport,
            })

            if (res.success) {
                const recoveredAddress = SignMessageUtils.recover({
                    message: _message,
                    signature: res.payload.toString("hex"),
                    chain: "vechain",
                })

                if (compareAddresses(recoveredAddress, accountWithDevice.address)) {
                    error(ERROR_EVENTS.LEDGER, "Recovered address does not match")
                }

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
    }, [utfMessage, accountWithDevice, withTransport])

    /** Effects */

    /**
     * Sign the transaction when the device is connected and the clauses are enabled
     */
    useEffect(() => {
        if (!appOpen || userRejected) return
        signMessage()
    }, [userRejected, signMessage, appOpen])

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
        nav.navigate(Routes.HOME)
    }, [nav])

    const handleOnConfirm = useCallback(async () => {
        try {
            if (!signature) return
            setIsSending(true)

            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)

            await processRequest(requestEvent, HexUtils.addPrefix(signature.toString("hex")))

            await removeLedger()

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
    }, [removeLedger, requestEvent, processRequest, LL, signature, navigateOnFinish])

    const handleOnRetry = useCallback(() => {
        // this will trigger the useEffect to sign the transaction again
        setUserRejected(false)
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
            <BackButtonHeader beforeNavigating={removeLedger} />
            <BaseView alignItems="flex-start" flexGrow={1} flex={1} mx={20}>
                <BaseText typographyFont="title">{LL.SEND_LEDGER_TITLE()}</BaseText>
                <BaseText typographyFont="body" my={10}>
                    {LL.LEDGER_MESSAGE_TITLE_SB()}
                </BaseText>
                <BaseSpacer height={20} />
                <Lottie source={BlePairingDark} autoPlay loop style={styles.lottie} />
                <BaseSpacer height={20} />
                <StepsProgressBar steps={Steps} currentStep={currentStep} isCurrentStepError={!!signingError} />
                <BaseSpacer height={96} />
                <BaseText typographyFont="bodyBold">{Steps[currentStep]?.title || LL.LEDGER_MESSAGE_READY()}</BaseText>
                <BaseText typographyFont="body" mt={8}>
                    {Steps[currentStep]?.subtitle || LL.LEDGER_MESSAGE_READ_SB()}
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
