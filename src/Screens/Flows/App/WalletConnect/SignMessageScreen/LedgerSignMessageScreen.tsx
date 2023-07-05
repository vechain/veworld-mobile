import { NativeStackScreenProps } from "@react-navigation/native-stack"
import React, { FC, useCallback, useEffect, useMemo, useState } from "react"
import { StyleSheet } from "react-native"
import {
    BackButtonHeader,
    BaseSafeArea,
    BaseSpacer,
    BaseText,
    BaseView,
    BluetoothStatusBottomSheet,
    ConnectionErrorBottomSheet,
    Step,
    StepsProgressBar,
    showErrorToast,
    useWalletConnect,
    BaseButton,
} from "~Components"
import { RootStackParamListSwitch, Routes } from "~Navigation"
import Lottie from "lottie-react-native"
import { useI18nContext } from "~i18n"
import { useNavigation } from "@react-navigation/native"
import { useBottomSheetModal, useLedger, useLegderConfig } from "~Hooks"
import { LEDGER_ERROR_CODES, VETLedgerApp } from "~Constants"
import { LedgerUtils, error, debug, WalletConnectResponseUtils } from "~Utils"
import * as Haptics from "expo-haptics"
import { BlePairingDark } from "~Assets"

type Props = NativeStackScreenProps<
    RootStackParamListSwitch,
    Routes.LEDGER_SIGN_MESSAGE_SCREEN
>

export const LedgerSignMessageScreen: FC<Props> = ({ route }: Props) => {
    const {
        accountWithDevice,
        certificate,
        initialRoute,
        origin = "app",
        requestEvent,
    } = route.params

    const { LL } = useI18nContext()
    const nav = useNavigation()
    const { web3Wallet } = useWalletConnect()

    const [signature, setSignature] = useState<Buffer>()

    // If the tx is ready and the signature has been requested to the device
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
        if (!vetApp || !clausesEnabled || !contractEnabled) return

        const signCertificate = async () => {
            try {
                //recreate transport to avoid DisconnectedDeviceDuringOperation error
                await openBleConnection()
                if (!transport) {
                    throw new Error("Transport is not defined")
                }

                const vetLedger = new VETLedgerApp(transport)
                const _signature = await LedgerUtils.signCertificate(
                    accountWithDevice.index,
                    certificate,
                    accountWithDevice.device,
                    vetLedger,
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
        contractEnabled,
        clausesEnabled,
        transport,
        certificate,
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
            if (!signature) throw new Error("Unexpected error with signature")

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

            if (origin === "walletConnect") {
                await WalletConnectResponseUtils.signMessageRequestErrorResponse(
                    {
                        request: requestEvent,
                        web3Wallet,
                        LL,
                    },
                )
            }
        } finally {
            setIsSending(false)
        }
    }, [
        LL,
        signature,
        navigateOnFinish,
        origin,
        requestEvent,
        web3Wallet,
        certificate,
    ])

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
                    isCurrentStepError={!!signingError}
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
            <BaseButton
                style={styles.button}
                mx={24}
                haptics="light"
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
