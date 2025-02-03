import React, { FC } from "react"
import { StyleSheet } from "react-native"
import { BaseSpacer, BaseText, BaseView, CardWithHeader } from "~Components"
import { ColorThemeType } from "~Constants"
import { useThemedStyles } from "~Hooks"
import { useI18nContext } from "~i18n"
import { LocalDevice } from "~Model"
import { ManualBackupContent } from "../ManualBackupContent"
import { CloudBackupCard } from "./CloudBackupCard"

type Props = {
    credential: string[] | string
    deviceToBackup?: LocalDevice
}

export const CloudAndManualBackup: FC<Props> = ({ credential, deviceToBackup }) => {
    const { LL } = useI18nContext()
    const { styles } = useThemedStyles(baseStyles)
    const isMnemonic = Array.isArray(credential)

    return (
        <BaseView>
            <BaseText typographyFont="subSubTitleMedium">{deviceToBackup?.alias}</BaseText>
            <BaseSpacer height={16} />
            <CloudBackupCard credential={credential} deviceToBackup={deviceToBackup} />
            <BaseSpacer height={16} />
            <BaseView flexDirection="row" w={100}>
                <BaseSpacer style={styles.line} height={1} />
                <BaseSpacer width={16} />
                <BaseText typographyFont="captionSemiBold">OR</BaseText>
                <BaseSpacer width={16} />
                <BaseSpacer style={styles.line} height={1} />
            </BaseView>
            <BaseSpacer height={16} />
            <CardWithHeader title={LL.TITLE_BACKUP_MANUALLY()} iconName="icon-pencil">
                <BaseView>
                    <BaseText typographyFont="captionRegular">
                        {isMnemonic ? LL.BD_MNEMONIC_PASSWORD_WARNING() : LL.BD_PRIVATE_KEY_PASSWORD_WARNING()}
                    </BaseText>
                    <BaseSpacer height={12} />
                    <ManualBackupContent credential={credential} deviceToBackup={deviceToBackup} />
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
