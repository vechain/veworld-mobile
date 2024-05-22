import React, { useCallback, useEffect } from "react"
import {
    BaseButton,
    BaseSafeArea,
    BaseSpacer,
    BaseText,
    BaseView,
    RequireUserPassword,
    SelectDeviceBottomSheet,
} from "~Components"
import { useBottomSheetModal, useDisclosure, useWalletSecurity } from "~Hooks"
import { useBackupMnemonic } from "../PrivacyScreen/Hooks/useBackupMnemonic"
import { LocalDevice } from "~Model"
import { selectLocalDevices, useAppSelector } from "~Storage/Redux"
import { BackupMnemonicBottomSheet } from "../PrivacyScreen/Components"
import { BackHandler } from "react-native"
import { BackupWarningBottomSheet } from "../PrivacyScreen/Components/BackupWarningBottomSheet"

export const SecurityUpgrade_V2 = () => {
    useEffect(() => {
        // Remove hardware back button press for this screen on Android
        const backHandler = BackHandler.addEventListener("hardwareBackPress", () => false)
        return () => backHandler.remove()
    }, [])

    const { isWalletSecurityBiometrics } = useWalletSecurity()
    const devices = useAppSelector(selectLocalDevices) as LocalDevice[]
    const { isOpen: isPasswordPromptOpen, onOpen: openPasswordPrompt, onClose: closePasswordPrompt } = useDisclosure()

    const onRunV2Upgrade = useCallback(() => {
        /*
            TODO

            1. get all wallets and decrypt them using the old flow
            2. encrypt them using the new flow
            3. save them back to the storage
            4. remove the old keys from the keychain
        */
    }, [])

    const {
        ref: BackupPhraseSheetRef,
        openWithDelay: openBackupPhraseSheetWithDelay,
        onClose: closeBackupPhraseSheet,
    } = useBottomSheetModal()

    const {
        ref: walletMgmtBottomSheetRef,
        openWithDelay: openWalletMgmtSheetWithDelay,
        onClose: closeWalletMgmtSheet,
    } = useBottomSheetModal()

    const {
        ref: backupWarningSheetRef,
        onOpen: openBackupWarningSheet,
        onClose: closeBackupWarningSheet,
    } = useBottomSheetModal()

    const { onPasswordSuccess, checkSecurityBeforeOpening, handleOnSelectedWallet, mnemonicArray } = useBackupMnemonic({
        closePasswordPrompt,
        openBackupPhraseSheetWithDelay,
        openWalletMgmtSheetWithDelay,
        openPasswordPrompt,
        closeWalletMgmtSheet,
        devices,
        isWalletSecurityBiometrics,
    })

    return (
        <BaseSafeArea grow={1}>
            <BaseView justifyContent="space-between" alignItems="center" h={100}>
                <BaseView alignItems="center">
                    <BaseText>{"SecurityUpgrade_V2"}</BaseText>

                    <BaseSpacer height={69} />

                    <BaseText>{"Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aliquam."}</BaseText>

                    <BaseSpacer height={69} />

                    <BaseButton title="BACKUP NOW" action={checkSecurityBeforeOpening} />
                </BaseView>

                <BaseView pb={62}>
                    <BaseButton title="Upgrade Security" action={openBackupWarningSheet} />
                </BaseView>
            </BaseView>

            <BackupMnemonicBottomSheet
                ref={BackupPhraseSheetRef}
                onClose={closeBackupPhraseSheet}
                mnemonicArray={mnemonicArray}
            />

            <SelectDeviceBottomSheet<LocalDevice>
                ref={walletMgmtBottomSheetRef}
                onClose={handleOnSelectedWallet}
                devices={devices}
            />

            <RequireUserPassword
                isOpen={isPasswordPromptOpen}
                onClose={closePasswordPrompt}
                onSuccess={onPasswordSuccess}
            />

            <BackupWarningBottomSheet
                ref={backupWarningSheetRef}
                onConfirm={onRunV2Upgrade}
                onClose={closeBackupWarningSheet}
                isUpgradeSecurity={true}
            />
        </BaseSafeArea>
    )
}
