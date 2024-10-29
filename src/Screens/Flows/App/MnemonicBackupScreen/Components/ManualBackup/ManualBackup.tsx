import React from "react"
import { BaseSpacer, BaseText, BaseView, MnemonicBackupAlert } from "~Components"
import { useI18nContext } from "~i18n"
import { LocalDevice } from "~Model"
import { LastBackupAlert } from "../index"
import { ManualOnlyCard } from "./ManualOnlyCard"

type Props = {
    mnemonicArray: string[]
    deviceToBackup?: LocalDevice
}

export const ManualBackup = ({ mnemonicArray, deviceToBackup }: Props) => {
    const { LL } = useI18nContext()
    return (
        <BaseView>
            {deviceToBackup?.isBuckedUp && (
                <>
                    <LastBackupAlert deviceToBackup={deviceToBackup} />
                    <BaseSpacer height={24} />
                </>
            )}
            <BaseText typographyFont="subSubTitleMedium">{deviceToBackup?.alias}</BaseText>
            <BaseSpacer height={16} />
            <BaseText typographyFont="captionRegular">{LL.BD_MNEMONIC_PASSWORD_WARNING()}</BaseText>
            <BaseSpacer height={16} />
            <ManualOnlyCard mnemonicArray={mnemonicArray} deviceToBackup={deviceToBackup} />
            <BaseSpacer height={16} />
            <MnemonicBackupAlert />
        </BaseView>
    )
}
