import { NativeStackScreenProps } from "@react-navigation/native-stack"
import Lottie from "lottie-react-native"
import React, { useCallback, useEffect, useMemo, useState } from "react"
import { StyleSheet } from "react-native"
import { Transaction } from "thor-devkit"
import { BlePairingDark } from "~Assets"
import {
    LEDGER_ERROR_CODES,
    debug,
    error,
    useBottomSheetModal,
    useLedger,
} from "~Common"
import {
    BackButtonHeader,
    BaseButton,
    BaseSafeArea,
    BaseSpacer,
    BaseText,
    BaseView,
    BluetoothStatusBottomSheet,
    ConnectionErrorBottomSheet,
    Step,
    StepsProgressBar,
} from "~Components"
import {
    RootStackParamListDiscover,
    RootStackParamListHome,
    Routes,
} from "~Navigation"
import { LedgerUtils } from "~Utils"
import { useI18nContext } from "~i18n"

type Props = NativeStackScreenProps<
    RootStackParamListHome & RootStackParamListDiscover,
    Routes.LEDGER_SIGN_TRANSACTION
>

export const LedgerSignTransaction: React.FC<Props> = ({ route }) => {
    const { accountWithDevice, transaction } = route.params
    const { LL } = useI18nContext()

    const [signature, setSignature] = useState<Buffer>()

    // If the tx is ready and the signature has been requested to the device
    const [isAwaitingSignature, setIsAwaitingSignature] = useState(false)

    const [signingError, setSigningError] = useState<boolean>()

    const {
        ref: connectionErrorSheetRef,
        onOpen: openConnectionErrorSheet,
        onClose: closeConnectionErrorSheet,
    } = useBottomSheetModal()

    const onConnectionError = useCallback(() => {
        openConnectionErrorSheet()
    }, [openConnectionErrorSheet])

    const { errorCode, setTimerEnabled, vetApp } = useLedger({
        deviceId: accountWithDevice.device.deviceId,
        waitFirstManualConnection: false,
        onConnectionError,
    })

    // errorCode + validate signature
    const ledgerErrorCode = useMemo(() => {
        if (isAwaitingSignature) return LEDGER_ERROR_CODES.WAITING_SIGNATURE
        return errorCode
    }, [errorCode, isAwaitingSignature])

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

        if (!signature) return 1

        return 2
    }, [vetApp, signature])

    useEffect(() => {
        if (!vetApp) return

        const signTransaction = async () => {
            try {
                const _signature = await LedgerUtils.signTransaction(
                    accountWithDevice.index,
                    new Transaction(transaction),
                    accountWithDevice.device,
                    vetApp,
                    () => setIsAwaitingSignature(true),
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
        signTransaction()
    }, [vetApp, accountWithDevice, transaction])
    const handleOnConfirm = () => {}

    const onConnectionErrorDismiss = useCallback(() => {
        setTimerEnabled(false)
    }, [setTimerEnabled])

    useEffect(() => {
        if (ledgerErrorCode) {
            openConnectionErrorSheet()
        }
        if (!ledgerErrorCode) {
            closeConnectionErrorSheet()
        }
    }, [ledgerErrorCode, closeConnectionErrorSheet, openConnectionErrorSheet])

    return (
        <BaseSafeArea grow={1}>
            <BackButtonHeader />
            <BaseView
                alignItems="center"
                justifyContent="space-between"
                flexGrow={1}
                mx={20}>
                <BaseView alignSelf="flex-start" w={100}>
                    <BaseText typographyFont="title">
                        {LL.WALLET_LEDGER_SELECT_DEVICE_TITLE()}
                    </BaseText>
                    <BaseText typographyFont="body" my={10}>
                        {LL.WALLET_LEDGER_SELECT_DEVICE_SB()}
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

                <BaseView w={100}>
                    <BaseButton
                        action={handleOnConfirm}
                        title={LL.COMMON_BTN_CONFIRM()}
                        disabled={!signature}
                    />
                </BaseView>
            </BaseView>

            <BaseSpacer height={40} />
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
})
