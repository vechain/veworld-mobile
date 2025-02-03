import { NativeStackScreenProps } from "@react-navigation/native-stack"
import React from "react"
import { BaseSpacer, BaseView, Layout } from "~Components"
import { useI18nContext } from "~i18n"
import { RootStackParamListSettings, Routes } from "~Navigation"
import { CloudAndManualBackup, ManualBackup } from "./Components"
import { PlatformUtils } from "~Utils"
import { selectGoogleDriveBackupEnabled, useAppSelector } from "~Storage/Redux"

type Props = NativeStackScreenProps<RootStackParamListSettings, Routes.ICLOUD_CREDENTIALS_BACKUP>

export const CredentialBackupScreen = ({ route }: Props) => {
    const { LL } = useI18nContext()
    const googleDriveBackupEnabled = useAppSelector(selectGoogleDriveBackupEnabled)
    const manualOnlyBackup = !googleDriveBackupEnabled && PlatformUtils.isAndroid()

    const { credential, deviceToBackup } = route.params

    return (
        <Layout
            noStaticBottomPadding
            title={LL.SB_RECOVERY_PHRASE()}
            body={
                <BaseView>
                    {!manualOnlyBackup ? (
                        <CloudAndManualBackup credential={credential} deviceToBackup={deviceToBackup} />
                    ) : (
                        <ManualBackup credential={credential} deviceToBackup={deviceToBackup} />
                    )}
                    <BaseSpacer height={24} />
                </BaseView>
            }
        />
    )
}
