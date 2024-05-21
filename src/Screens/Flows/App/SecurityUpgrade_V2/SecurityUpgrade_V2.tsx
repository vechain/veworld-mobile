import React, { useCallback } from "react"
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

export const SecurityUpgrade_V2 = () => {
    const { isWalletSecurityBiometrics } = useWalletSecurity()
    const devices = useAppSelector(selectLocalDevices) as LocalDevice[]
    const { isOpen: isPasswordPromptOpen, onOpen: openPasswordPrompt, onClose: closePasswordPrompt } = useDisclosure()

    const onRunV2Upgrade = useCallback(() => {
        // run state and wallet upgrade
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
                    <BaseButton title="DONE" action={onRunV2Upgrade} />
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
        </BaseSafeArea>
    )
}
