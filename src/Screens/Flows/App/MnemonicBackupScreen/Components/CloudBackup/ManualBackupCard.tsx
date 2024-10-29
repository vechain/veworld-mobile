import { BaseSpacer, BaseText, BaseView, MnemonicBackupAlert, MnemonicCard } from "~Components"
import { DoNotShareAlert, CopyMnemonicButton } from "~Screens/Flows/App/MnemonicBackupScreen/Components"
import React, { memo } from "react"
import { useI18nContext } from "~i18n"
import { LocalDevice } from "~Model"
import { CardWithHeader } from "~Components/Reusable/CardWithHeader"

type Props = {
    mnemonicArray: string[]
    deviceToBackup?: LocalDevice
}

export const ManualBackupCard = memo(({ mnemonicArray, deviceToBackup }: Props) => {
    const { LL } = useI18nContext()

    return (
        <CardWithHeader title={LL.TITLE_BACKUP_MANUALLY()} iconName="pencil-outline">
            <BaseView>
                <BaseText typographyFont="captionRegular">{LL.BD_MNEMONIC_PASSWORD_WARNING()}</BaseText>
                <BaseSpacer height={12} />
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
            </BaseView>
            <BaseSpacer height={20} />
            <MnemonicBackupAlert />
        </CardWithHeader>
    )
})
