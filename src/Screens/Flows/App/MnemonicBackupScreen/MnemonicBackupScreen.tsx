import { NativeStackScreenProps } from "@react-navigation/native-stack"
import React from "react"
import { BaseSpacer, BaseView, Layout } from "~Components"
import { useCloudBackup } from "~Hooks"
import { useI18nContext } from "~i18n"
import { RootStackParamListSettings, Routes } from "~Navigation"
import { CloudAndManualBackup, ManualBackup } from "./Components"

type Props = NativeStackScreenProps<RootStackParamListSettings, Routes.ICLOUD_MNEMONIC_BACKUP>

export const MnemonicBackupScreen = ({ route }: Props) => {
    const { LL } = useI18nContext()
    const { isCloudAvailable } = useCloudBackup()

    const { mnemonicArray, deviceToBackup } = route.params

    return (
        <Layout
            noStaticBottomPadding
            noBackButton
            pageHeader={LL.SB_RECOVERY_PHRASE()}
            body={
                <BaseView>
                    {isCloudAvailable ? (
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
