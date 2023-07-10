import React, { useCallback, useState } from "react"
import { useBottomSheetModal, useDisclosure, useWalletSecurity } from "~Hooks"
import {
    BaseButtonGroupHorizontal,
    BaseSpacer,
    BaseText,
    RequireUserPassword,
} from "~Components"
import { useSecurityUpgrade } from "../Hooks/useSecurityUpgrade"
import { useI18nContext } from "~i18n"
import { useSecurityButtons } from "../Hooks/useSecurityButtons"
import { BackupWarningBottomSheet } from "./BackupWarningBottomSheet"
import { BaseButtonGroupHorizontalType, SecurityLevelType } from "~Model"

export const EnableBiometrics = () => {
    // State for the current button
    const [currentButton, setCurrentButton] =
        useState<BaseButtonGroupHorizontalType>()

    const runSecurityUpgrade = useSecurityUpgrade()
    const { LL } = useI18nContext()

    const {
        isOpen: isPasswordPromptOpen,
        onOpen: openPasswordPrompt,
        onClose: closePasswordPrompt,
    } = useDisclosure()

    const {
        ref: backupWarningSheetRef,
        onOpen: openBackupWarningSheet,
        onClose: closeBackupWarningSheet,
    } = useBottomSheetModal()

    const { securityButtons, shouldCallRequireBiometricsAndEnableIt } =
        useSecurityButtons(openPasswordPrompt)

    const { isWalletSecurityBiometrics } = useWalletSecurity()

    const onPasswordSuccess = useCallback(
        async (password: string) => {
            await runSecurityUpgrade(password, () => {
                // weird crashes happen occasionally without this timeout, also the reason why we use the callback here
                // https://stackoverflow.com/questions/61170501/exception-thrown-while-executing-ui-block-parentnode-is-a-required-a-required
                setTimeout(() => {
                    closePasswordPrompt()
                }, 10)
            })
        },
        [runSecurityUpgrade, closePasswordPrompt],
    )

    const onButtonPress = useCallback(
        (button: BaseButtonGroupHorizontalType) => {
            if (
                button.id !== SecurityLevelType.BIOMETRIC ||
                isWalletSecurityBiometrics
            )
                return

            setCurrentButton(button)
            openBackupWarningSheet()
        },
        [isWalletSecurityBiometrics, openBackupWarningSheet],
    )

    const handleOnProceed = useCallback(() => {
        if (!currentButton) return

        shouldCallRequireBiometricsAndEnableIt(currentButton)
    }, [shouldCallRequireBiometricsAndEnableIt, currentButton])

    return (
        <>
            <BaseText typographyFont="bodyMedium">
                {LL.SB_SECURITY_METHOD()}
            </BaseText>
            <BaseText typographyFont="caption">
                {LL.BD_SECURITY_METHOD()}
            </BaseText>

            <BaseSpacer height={24} />

            <BaseButtonGroupHorizontal
                selectedButtonIds={[securityButtons.currentSecurity]}
                buttons={securityButtons.buttons}
                action={onButtonPress}
            />

            <RequireUserPassword
                isOpen={isPasswordPromptOpen}
                onClose={closePasswordPrompt}
                onSuccess={onPasswordSuccess}
            />

            <BackupWarningBottomSheet
                ref={backupWarningSheetRef}
                onConfirm={handleOnProceed}
                onClose={closeBackupWarningSheet}
                isUpgradeSecurity={true}
            />
        </>
    )
}
