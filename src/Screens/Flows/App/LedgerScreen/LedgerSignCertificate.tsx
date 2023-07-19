import { NativeStackScreenProps } from "@react-navigation/native-stack"
import Lottie from "lottie-react-native"
import React, { useCallback, useEffect, useMemo, useState } from "react"
import { StyleSheet } from "react-native"
import { BlePairingDark } from "~Assets"
import { useBottomSheetModal, useLedger, useLegderConfig } from "~Hooks"
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

export const LedgerSignCertificate: React.FC<Props> = ({ route }) => {
    const { accountWithDevice, certificate, initialRoute, requestEvent } =
        route.params

    const { web3Wallet } = useWalletConnect()

    const { LL } = useI18nContext()
    const nav = useNavigation()

    const [signature, setSignature] = useState<Buffer>()
    const [isAwaitingSignature, setIsAwaitingSignature] = useState(false)
    const [signingError, setSigningError] = useState<boolean>()
    const [isSending, setIsSending] = useState(false)

    const {
        ref: connectionErrorSheetRef,
        onOpen: openConnectionErrorSheet,
        onClose: closeConnectionErrorSheet,
    } = useBottomSheetModal()

    const onConnectionError = useCallback(() => {
        openConnectionErrorSheet()
    }, [openConnectionErrorSheet])

    const {
        errorCode,
        setTimerEnabled,
        vetApp,
        openBleConnection,
        openOrFinalizeConnection,
        transport,
    } = useLedger({
        deviceId: accountWithDevice.device.deviceId,
        waitFirstManualConnection: false,
        onConnectionError,
    })

    const { config, clausesEnabled, contractEnabled } = useLegderConfig({
        app: vetApp,
        onGetLedgerConfigError: openOrFinalizeConnection,
    })

    // errorCode + validate signature
    const ledgerErrorCode = useMemo(() => {
        if (errorCode) return errorCode
        if (config) {
            if (!clausesEnabled && !contractEnabled)
                return LEDGER_ERROR_CODES.CONTRACT_AND_CLAUSES_DISABLED
            if (!clausesEnabled) return LEDGER_ERROR_CODES.CLAUSES_DISABLED
            if (!contractEnabled) return LEDGER_ERROR_CODES.CONTRACT_DISABLED
        }

        if (isAwaitingSignature && !signingError)
            return LEDGER_ERROR_CODES.WAITING_SIGNATURE
    }, [
        errorCode,
        config,
        isAwaitingSignature,
        signingError,
        clausesEnabled,
        contractEnabled,
    ])

    const Steps: Step[] = useMemo(
        () => [
            {
                isActiveText: "Connecting",
                isNextText: "Connect",
                isDoneText: "Connected",
                progressPercentage: 25,
                title: LL.SEND_LEDGER_CHECK_CONNECTION(),
                subtitle: LL.SEND_LEDGER_CHECK_CONNECTION_SB(),
            },
            {
                isActiveText: "Checking",
                isNextText: "Check status",
                isDoneText: "Status OK",
                progressPercentage: 50,
                title: LL.SEND_LEDGER_CHECK_CONNECTION(),
                subtitle: LL.SEND_LEDGER_CHECK_CONNECTION_SB(),
            },
            {
                isActiveText: "Signing",
                isNextText: "Sign data",
                isDoneText: "Data Signed",
                progressPercentage: 75,
                title: LL.SEND_LEDGER_SIGN_DATA(),
                subtitle: LL.SEND_LEDGER_SIGN_DATA_SB(),
            },
        ],
        [LL],
    )

    const currentStep = useMemo(() => {
        if (!vetApp) return 0

        if (!clausesEnabled || !contractEnabled) return 1

        if (!signature) return 2

        return 3
    }, [vetApp, signature, clausesEnabled, contractEnabled])

    /** Effects */

    /**
     * Sign the transaction when the device is connected and the clauses are enabled
     */
    useEffect(() => {
        if (!vetApp) return

        const signCertificate = async () => {
            try {
                //recreate transport to avoid DisconnectedDeviceDuringOperation error
                await openBleConnection()
                if (!transport) {
                    throw new Error("Transport is not defined")
                }
                const _signature = await LedgerUtils.signCertificate(
                    accountWithDevice.index,
                    certificate,
                    accountWithDevice.device,
                    transport,
                )
                debug("Signature OK")
                setSignature(_signature)
            } catch (e) {
                error(e)
                setSigningError(true)
            } finally {
                setIsAwaitingSignature(false)
            }
        }
        signCertificate()
    }, [
        openBleConnection,
        vetApp,
        accountWithDevice,
        certificate,
        contractEnabled,
        clausesEnabled,
        transport,
    ])

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

            navigateOnFinish()
        } catch (e) {
            error(e)
            showErrorToast(LL.ERROR(), LL.ERROR_GENERIC_OPERATION())
            await Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Error,
            )
        } finally {
            setIsSending(false)
        }
    }, [requestEvent, web3Wallet, LL, signature, certificate, navigateOnFinish])

    const onConnectionErrorDismiss = useCallback(() => {
        setTimerEnabled(false)
    }, [setTimerEnabled])

    return (
        <BaseSafeArea grow={1}>
            <BackButtonHeader />
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
            <BaseButton
                style={styles.button}
                mx={24}
                haptics="Light"
                title={LL.COMMON_BTN_CONFIRM()}
                disabled={!signature || isSending}
                isLoading={isSending}
                action={handleOnConfirm}
            />

            <BluetoothStatusBottomSheet />
            <ConnectionErrorBottomSheet
                ref={connectionErrorSheetRef}
                onDismiss={onConnectionErrorDismiss}
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
