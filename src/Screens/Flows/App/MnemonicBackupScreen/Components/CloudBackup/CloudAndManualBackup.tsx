import React, { FC } from "react"
import { BaseSpacer, BaseText, BaseView } from "~Components"
import { CloudBackupCard } from "./CloudBackupCard"
import { LocalDevice } from "~Model"
import { useThemedStyles } from "~Hooks"
import { ColorThemeType } from "~Constants"
import { StyleSheet } from "react-native"
import { LastBackupAlert } from "~Screens/Flows/App/MnemonicBackupScreen/Components"
import { ManualBackupContent } from "~Screens/Flows/App/MnemonicBackupScreen/Components/ManualBackupContent"
import { CardWithHeader } from "~Components/Reusable/CardWithHeader"
import { useI18nContext } from "~i18n"

type Props = {
    mnemonicArray: string[]
    deviceToBackup?: LocalDevice
}

export const CloudAndManualBackup: FC<Props> = ({ mnemonicArray, deviceToBackup }) => {
    const { LL } = useI18nContext()
    const { styles } = useThemedStyles(baseStyles)

    return (
        <BaseView>
            <BaseText typographyFont="subSubTitleMedium">{deviceToBackup?.alias}</BaseText>
            {deviceToBackup?.isBuckedUp && (
                <>
                    <BaseSpacer height={16} />
                    <LastBackupAlert deviceToBackup={deviceToBackup} />
                </>
            )}
            <BaseSpacer height={16} />
            <CloudBackupCard mnemonicArray={mnemonicArray} deviceToBackup={deviceToBackup} />
            <BaseSpacer height={16} />
            <BaseView flexDirection="row" w={100}>
                <BaseSpacer style={styles.line} height={1} />
                <BaseSpacer width={16} />
                <BaseText typographyFont="captionSemiBold">OR</BaseText>
                <BaseSpacer width={16} />
                <BaseSpacer style={styles.line} height={1} />
            </BaseView>
            <BaseSpacer height={16} />
            <CardWithHeader title={LL.TITLE_BACKUP_MANUALLY()} iconName="pencil-outline">
                <BaseView>
                    <BaseText typographyFont="captionRegular">{LL.BD_MNEMONIC_PASSWORD_WARNING()}</BaseText>
                    <BaseSpacer height={12} />
                    <ManualBackupContent mnemonicArray={mnemonicArray} deviceToBackup={deviceToBackup} />
                </BaseView>
            </CardWithHeader>
        </BaseView>
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        line: {
            flex: 1,
            backgroundColor: theme.colors.placeholder,
        },
    })
