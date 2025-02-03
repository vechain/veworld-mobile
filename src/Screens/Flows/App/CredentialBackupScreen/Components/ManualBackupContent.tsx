import React from "react"
import { BaseSpacer, BaseView, CredentialAvoidScreenshotAlert, MnemonicCard } from "~Components"
import { LocalDevice } from "~Model"
import { CopyCredentialButton } from "./CopyCredentialButton"
import { DoNotShareAlert } from "./DoNotShareAlert"
import { ManualBackupDoneBanner } from "./ManualBackupDoneBanner"

export const ManualBackupContent = ({
    credential,
    deviceToBackup,
}: {
    credential: string[] | string
    deviceToBackup?: LocalDevice
}) => {
    return (
        <BaseView>
            <DoNotShareAlert credential={credential} />
            <BaseSpacer height={12} />
            {!!credential.length && (
                <MnemonicCard
                    credential={credential}
                    souceScreen="BackupMnemonicBottomSheet"
                    deviceToBackup={deviceToBackup}
                />
            )}
            <BaseSpacer height={8} />
            <CopyCredentialButton credential={credential} deviceToBackup={deviceToBackup} />
            <BaseSpacer height={20} />
            <CredentialAvoidScreenshotAlert credential={credential} />
            {deviceToBackup?.isBackedUpManual && (
                <>
                    <BaseSpacer height={12} />
                    <ManualBackupDoneBanner />
                </>
            )}
        </BaseView>
    )
}
