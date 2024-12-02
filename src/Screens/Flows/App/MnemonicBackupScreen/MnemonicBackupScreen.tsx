import { NativeStackScreenProps } from "@react-navigation/native-stack"
import React from "react"
import { BaseSpacer, BaseView, Layout } from "~Components"
import { useI18nContext } from "~i18n"
import { RootStackParamListSettings, Routes } from "~Navigation"
import { CloudAndManualBackup, ManualBackup } from "./Components"
import { PlatformUtils } from "~Utils"
import { selectGoogleDriveBackupEnabled, useAppSelector } from "~Storage/Redux"

type Props = NativeStackScreenProps<RootStackParamListSettings, Routes.ICLOUD_MNEMONIC_BACKUP>

export const MnemonicBackupScreen = ({ route }: Props) => {
    const { LL } = useI18nContext()
    const googleDriveBackupEnabled = useAppSelector(selectGoogleDriveBackupEnabled)
    const manualOnlyBackup = !googleDriveBackupEnabled && PlatformUtils.isAndroid()

    const { mnemonicArray, deviceToBackup } = route.params

    return (
        <Layout
            noStaticBottomPadding
            noBackButton
            pageHeader={LL.SB_RECOVERY_PHRASE()}
            body={
                <BaseView>
                    {!manualOnlyBackup ? (
                        <CloudAndManualBackup mnemonicArray={mnemonicArray} deviceToBackup={deviceToBackup} />
                    ) : (
                        <ManualBackup mnemonicArray={mnemonicArray} deviceToBackup={deviceToBackup} />
                    )}
                    <BaseSpacer height={24} />
                </BaseView>
            }
        />
    )
}
