import React from "react"
import { BaseSpacer, BaseView, Layout } from "~Components"
import { useI18nContext } from "~i18n"
import { useCloudKit } from "~Hooks"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { RootStackParamListSettings, Routes } from "~Navigation"
import { CloudAndManualBackup } from "./Components/CloudBackup"
import { ManualBackup } from "./Components/ManualBackup"

type Props = {} & NativeStackScreenProps<RootStackParamListSettings, Routes.ICLOUD_MNEMONIC_BACKUP>

export const MnemonicBackupScreen = ({ route }: Props) => {
    const { LL } = useI18nContext()
    const { isCloudKitAvailable } = useCloudKit()

    const { mnemonicArray, deviceToBackup } = route.params

    return (
        <Layout
            noStaticBottomPadding
            noBackButton
            pageHeader={LL.SB_RECOVERY_PHRASE()}
            body={
                <BaseView>
                    {isCloudKitAvailable ? (
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
