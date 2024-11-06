import React, { useMemo } from "react"
import { BaseSpacer, BaseView, Layout } from "~Components"
import { useI18nContext } from "~i18n"
import { useCloudKit } from "~Hooks"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { RootStackParamListSettings, Routes } from "~Navigation"
import { CloudAndManualBackup } from "./Components/CloudBackup"
import { ManualBackup } from "./Components/ManualBackup"
import { useSelector } from "react-redux"
import { RootState } from "~Storage/Redux/Types"
import { LocalDevice } from "~Model"
import { selectDevice } from "~Storage/Redux"

type Props = {} & NativeStackScreenProps<RootStackParamListSettings, Routes.ICLOUD_MNEMONIC_BACKUP>

export const MnemonicBackupScreen = ({ route }: Props) => {
    const { LL } = useI18nContext()
    const { mnemonicArray, deviceToBackup } = route.params
    const { isCloudKitAvailable } = useCloudKit()

    const currentDevice = useSelector((state: RootState) => selectDevice(state, deviceToBackup?.rootAddress))

    const updatedDevice = useMemo(() => {
        if (!currentDevice) return deviceToBackup
        return {
            ...deviceToBackup,
            ...currentDevice,
        } as LocalDevice
    }, [currentDevice, deviceToBackup])

    return (
        <Layout
            noStaticBottomPadding
            noBackButton
            pageHeader={LL.SB_RECOVERY_PHRASE()}
            body={
                <BaseView>
                    {isCloudKitAvailable ? (
                        <CloudAndManualBackup mnemonicArray={mnemonicArray} deviceToBackup={updatedDevice} />
                    ) : (
                        <ManualBackup mnemonicArray={mnemonicArray} deviceToBackup={updatedDevice} />
                    )}
                    <BaseSpacer height={24} />
                </BaseView>
            }
        />
    )
}
