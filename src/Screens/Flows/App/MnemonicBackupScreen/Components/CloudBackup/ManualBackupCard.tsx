import { BaseSpacer, BaseText, BaseView, MnemonicBackupAlert, MnemonicCard } from "~Components"
import { DoNotShareAlert } from "~Screens/Flows/App/MnemonicBackupScreen/Components/DoNotShareAlert"
import React, { memo } from "react"
import { useI18nContext } from "~i18n"
import { IconHeaderCard } from "~Components/Reusable/IconHeaderCard"
import { LocalDevice } from "~Model"
import { CopyRecoveryPhraseButton } from "~Screens/Flows/App/MnemonicBackupScreen/Components/CopyRecoveryPhraseButton"

type Props = {
    mnemonicArray: string[]
    deviceToBackup?: LocalDevice
}

export const ManualBackupCard = memo(({ mnemonicArray, deviceToBackup }: Props) => {
    const { LL } = useI18nContext()

    return (
        <IconHeaderCard title={LL.TITLE_BACKUP_MANUALLY()} iconName="pencil-outline">
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
                <CopyRecoveryPhraseButton mnemonicArray={mnemonicArray} deviceToBackup={deviceToBackup} />
            </BaseView>
            <BaseSpacer height={12} />
            <MnemonicBackupAlert />
        </IconHeaderCard>
    )
})
