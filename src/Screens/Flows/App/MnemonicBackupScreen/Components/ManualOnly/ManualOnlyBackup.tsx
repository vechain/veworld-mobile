import React from "react"
import { ManualOnlyBackupCard } from "./ManualOnlyBackupCard"
import { BaseSpacer, BaseText, BaseView, MnemonicBackupAlert } from "~Components"
import { useI18nContext } from "~i18n"
import { LocalDevice } from "~Model"
import { IsBackedupAlert } from "~Screens/Flows/App/MnemonicBackupScreen/Components"

type Props = {
    mnemonicArray: string[]
    deviceToBackup?: LocalDevice
}

export const ManualOnlyBackup = ({ mnemonicArray, deviceToBackup }: Props) => {
    const { LL } = useI18nContext()
    return (
        <BaseView>
            <IsBackedupAlert />
            <BaseSpacer height={24} />
            <BaseText typographyFont="subSubTitleMedium">{deviceToBackup?.alias}</BaseText>
            <BaseSpacer height={16} />
            <BaseText typographyFont="captionRegular">{LL.BD_MNEMONIC_PASSWORD_WARNING()}</BaseText>
            <BaseSpacer height={16} />
            <ManualOnlyBackupCard mnemonicArray={mnemonicArray} />
            <BaseSpacer height={16} />
            <MnemonicBackupAlert />
        </BaseView>
    )
}
