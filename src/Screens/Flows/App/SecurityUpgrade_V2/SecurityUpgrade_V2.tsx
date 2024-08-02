import React, { useCallback, useState } from "react"
import {
    BaseButton,
    BaseSafeArea,
    BaseSpacer,
    BaseText,
    BaseView,
    RequireUserPassword,
    SelectDeviceBottomSheet,
    useApplicationSecurity,
} from "~Components"
import { useBackHandler, useBottomSheetModal, useDisclosure, useWalletSecurity } from "~Hooks"
import { useBackupMnemonic } from "../PrivacyScreen/Hooks/useBackupMnemonic"
import { BackHandlerEvent, LocalDevice } from "~Model"
import { selectLocalDevices, useAppSelector } from "~Storage/Redux"
import { BackupWarningBottomSheet } from "../PrivacyScreen/Components/BackupWarningBottomSheet"
import { useNavigation } from "@react-navigation/native"
import { Routes } from "~Navigation"

const PasswordPromptStatus = {
    INIT: "INIT",
    BACKUP_MNEMONIC: "BACKUP_MNEMONIC",
    UPGRADE_SECURITY: "UPGRADE_SECURITY",
} as const

type PasswordPromptStatus = keyof typeof PasswordPromptStatus

export const SecurityUpgrade_V2 = () => {
    const nav = useNavigation()
    useBackHandler(BackHandlerEvent.BLOCK)

    const [ppStatus, setPPStatus] = useState<PasswordPromptStatus>(PasswordPromptStatus.INIT)

    const { isWalletSecurityBiometrics } = useWalletSecurity()
    const { upgradeSecurityToV2 } = useApplicationSecurity()
    const devices = useAppSelector(selectLocalDevices) as LocalDevice[]
    const { isOpen: isPasswordPromptOpen, onOpen: openPasswordPrompt, onClose: closePasswordPrompt } = useDisclosure()

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

    const openBackupPhraseSheetWithDelay = useCallback(
        (delay: number, mnemonicArray: string[], deviceToBackup: LocalDevice) => {
            if (!mnemonicArray.length) return

            setTimeout(() => {
                nav.navigate(Routes.ICLOUD_MNEMONIC_BACKUP, { mnemonicArray, deviceToBackup })
            }, delay)
        },
        [nav],
    )

    const { onPasswordSuccess, checkSecurityBeforeOpening, handleOnSelectedWallet } = useBackupMnemonic({
        closePasswordPrompt,
        openBackupPhraseSheetWithDelay,
        openWalletMgmtSheetWithDelay,
        openPasswordPrompt,
        closeWalletMgmtSheet,
        devices,
        isWalletSecurityBiometrics,
    })

    const onBackupInitiated = useCallback(
        (password: string) => {
            closePasswordPrompt()
            upgradeSecurityToV2(password)
        },
        [closePasswordPrompt, upgradeSecurityToV2],
    )

    return (
        <BaseSafeArea grow={1}>
            <BaseView justifyContent="space-between" alignItems="center" h={100}>
                <BaseView alignItems="center">
                    <BaseText>{"SecurityUpgrade_V2"}</BaseText>

                    <BaseSpacer height={69} />

                    <BaseText>{"Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aliquam."}</BaseText>

                    <BaseSpacer height={69} />

                    <BaseButton
                        title="BACKUP NOW"
                        action={() => {
                            setPPStatus(PasswordPromptStatus.BACKUP_MNEMONIC)
                            checkSecurityBeforeOpening()
                        }}
                    />
                </BaseView>

                <BaseView pb={62}>
                    <BaseButton title="Upgrade Security" action={openBackupWarningSheet} />
                </BaseView>
            </BaseView>

            <SelectDeviceBottomSheet<LocalDevice>
                ref={walletMgmtBottomSheetRef}
                onClose={handleOnSelectedWallet}
                devices={devices}
            />

            <RequireUserPassword
                isOpen={isPasswordPromptOpen}
                onClose={closePasswordPrompt}
                onSuccess={(password: string) =>
                    ppStatus === PasswordPromptStatus.UPGRADE_SECURITY
                        ? onBackupInitiated(password)
                        : onPasswordSuccess(password)
                }
            />

            <BackupWarningBottomSheet
                ref={backupWarningSheetRef}
                onConfirm={() => {
                    setPPStatus(PasswordPromptStatus.UPGRADE_SECURITY)
                    // TODO - Vas -- what to do if the user is with faceID?
                    openPasswordPrompt()
                }}
                onClose={closeBackupWarningSheet}
                isUpgradeSecurity
            />
        </BaseSafeArea>
    )
}
