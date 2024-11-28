import React from "react"
import { BaseSpacer, BaseView, MnemonicAvoidScreenshotAlert, MnemonicCard } from "~Components"
import { LocalDevice } from "~Model"
import { CopyMnemonicButton } from "./CopyMnemonicButton"
import { DoNotShareAlert } from "./DoNotShareAlert"

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
            <BaseSpacer height={8} />
            <CopyMnemonicButton mnemonicArray={mnemonicArray} deviceToBackup={deviceToBackup} />
            <BaseSpacer height={20} />
            <MnemonicAvoidScreenshotAlert />
        </BaseView>
    )
}
