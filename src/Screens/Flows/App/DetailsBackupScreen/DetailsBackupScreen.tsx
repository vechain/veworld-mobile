import { NativeStackScreenProps } from "@react-navigation/native-stack"
import React from "react"
import { BaseSpacer, BaseView, Layout } from "~Components"
import { useI18nContext } from "~i18n"
import { RootStackParamListSettings, Routes } from "~Navigation"
import { CloudAndManualBackup, ManualBackup } from "./Components"
import { PlatformUtils } from "~Utils"
import { selectGoogleDriveBackupEnabled, useAppSelector } from "~Storage/Redux"

type Props = NativeStackScreenProps<RootStackParamListSettings, Routes.ICLOUD_DETAILS_BACKUP>

export const DetailsBackupScreen = ({ route }: Props) => {
    const { LL } = useI18nContext()
    const googleDriveBackupEnabled = useAppSelector(selectGoogleDriveBackupEnabled)
    const manualOnlyBackup = !googleDriveBackupEnabled && PlatformUtils.isAndroid()

    const { backupDetails, deviceToBackup } = route.params
    const isMnemonic = Array.isArray(backupDetails)

    return (
        <Layout
            noStaticBottomPadding
            title={isMnemonic ? LL.SB_RECOVERY_PHRASE() : LL.SB_PRIVATE_KEY()}
            body={
                <BaseView>
                    {!manualOnlyBackup ? (
                        <CloudAndManualBackup backupDetails={backupDetails} deviceToBackup={deviceToBackup} />
                    ) : (
                        <ManualBackup backupDetails={backupDetails} deviceToBackup={deviceToBackup} />
                    )}
                    <BaseSpacer height={24} />
                </BaseView>
            }
        />
    )
}
