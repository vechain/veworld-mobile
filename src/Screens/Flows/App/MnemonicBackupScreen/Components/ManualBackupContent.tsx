import { DoNotShareAlert } from "~Screens/Flows/App/MnemonicBackupScreen/Components/DoNotShareAlert"
import { BaseSpacer, BaseView, MnemonicAvoidScreenshotAlert, MnemonicCard } from "~Components"
import { CopyMnemonicButton } from "~Screens/Flows/App/MnemonicBackupScreen/Components/CopyMnemonicButton"
import React from "react"
import { LocalDevice } from "~Model"

export const ManualBackupContent = ({
    mnemonicArray,
    deviceToBackup,
}: {
    mnemonicArray: string[]
    deviceToBackup?: LocalDevice
}) => {
    return (
        <BaseView>
            <DoNotShareAlert />
            <BaseSpacer height={12} />
            {!!mnemonicArray.length && (
                <MnemonicCard
                    mnemonicArray={mnemonicArray}
                    souceScreen="BackupMnemonicBottomSheet"
                    deviceToBackup={deviceToBackup}
                />
            )}
            <BaseSpacer height={12} />
            <CopyMnemonicButton mnemonicArray={mnemonicArray} deviceToBackup={deviceToBackup} />
            <BaseSpacer height={20} />
            <MnemonicAvoidScreenshotAlert />
        </BaseView>
    )
}
