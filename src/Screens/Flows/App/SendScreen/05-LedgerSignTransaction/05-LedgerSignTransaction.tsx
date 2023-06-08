import { NativeStackScreenProps } from "@react-navigation/native-stack"
import Lottie from "lottie-react-native"
import React, { useCallback, useEffect, useMemo, useState } from "react"
import { StyleSheet } from "react-native"
import { Transaction } from "thor-devkit"
import { BlePairingDark } from "~Assets"
import { debug, error, useBottomSheetModal, useLedger } from "~Common"
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
                    () => {},
                )
                debug("Signature OK")
                setSignature(_signature)
            } catch (e) {
                error(e)
                setSigningError(true)
            }
        }
        signTransaction()
    }, [vetApp, accountWithDevice, transaction])
    const handleOnConfirm = () => {}

    const onConnectionErrorDismiss = useCallback(() => {
        setTimerEnabled(false)
    }, [setTimerEnabled])

    useEffect(() => {
        if (!errorCode) {
            closeConnectionErrorSheet()
        }
    }, [errorCode, closeConnectionErrorSheet])

    const Steps: Step[] = [
        {
            isActiveText: "Connecting",
            isNextText: "Connect",
            isDoneText: "Connected",
        },
        {
            isActiveText: "Signing",
            isNextText: "Sign data",
            isDoneText: "Data Signed",
        },
    ]

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
                error={errorCode}
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
