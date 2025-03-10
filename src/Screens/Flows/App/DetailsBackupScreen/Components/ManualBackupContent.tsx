import React from "react"
import { BaseSpacer, BaseView, AvoidScreenshotAlert, BackupDetailsCard } from "~Components"
import { LocalDevice } from "~Model"
import { CopyDetailsButton } from "./CopyDetailsButton"
import { DoNotShareAlert } from "./DoNotShareAlert"
import { ManualBackupDoneBanner } from "./ManualBackupDoneBanner"

export const ManualBackupContent = ({
    backupDetails,
    deviceToBackup,
}: {
    backupDetails: string[] | string
    deviceToBackup?: LocalDevice
}) => {
    return (
        <BaseView>
            <DoNotShareAlert backupDetails={backupDetails} />
            <BaseSpacer height={12} />
            {!!backupDetails.length && (
                <BackupDetailsCard
                    backupDetails={backupDetails}
                    souceScreen="BackupMnemonicBottomSheet"
                    deviceToBackup={deviceToBackup}
                />
            )}
            <BaseSpacer height={8} />
            <CopyDetailsButton backupDetails={backupDetails} deviceToBackup={deviceToBackup} />
            <BaseSpacer height={20} />
            <AvoidScreenshotAlert backupDetails={backupDetails} />
            {deviceToBackup?.isBackedUpManual && (
                <>
                    <BaseSpacer height={12} />
                    <ManualBackupDoneBanner />
                </>
            )}
        </BaseView>
    )
}
