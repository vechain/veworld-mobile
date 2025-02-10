import React from "react"
import { StyleSheet } from "react-native"
import { BaseCard, BaseSpacer, BaseText, BaseView } from "~Components"
import { COLORS, ColorThemeType } from "~Constants"
import { useThemedStyles } from "~Hooks"
import { useI18nContext } from "~i18n"
import { LocalDevice } from "~Model"
import { ManualBackupContent } from "../ManualBackupContent"

type Props = {
    backupDetails: string[] | string
    deviceToBackup?: LocalDevice
}

export const ManualBackup = ({ backupDetails, deviceToBackup }: Props) => {
    const { LL } = useI18nContext()
    const { styles } = useThemedStyles(baseStyles)
    const isMnemonic = Array.isArray(backupDetails)

    return (
        <BaseView>
            <BaseText typographyFont="subSubTitleMedium">{deviceToBackup?.alias}</BaseText>
            <BaseSpacer height={16} />
            <BaseText typographyFont="captionRegular">
                {isMnemonic ? LL.BD_MNEMONIC_PASSWORD_WARNING() : LL.BD_PRIVATE_KEY_PASSWORD_WARNING()}
            </BaseText>
            <BaseSpacer height={16} />
            <BaseCard containerStyle={styles.cardContainer} style={styles.card}>
                <ManualBackupContent backupDetails={backupDetails} deviceToBackup={deviceToBackup} />
            </BaseCard>
        </BaseView>
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        card: {
            display: "flex",
            flexDirection: "column",
            alignContent: "center",
            paddingTop: 16,
            paddingBottom: 12,
            paddingHorizontal: 16,
        },
        cardContainer: {
            display: "flex",
            borderWidth: 1,
            borderRadius: 12,
            paddingBottom: 0,
            paddingVertical: 0,
            borderColor: theme.isDark ? COLORS.DARK_PURPLE_DISABLED : theme.colors.cardBorder,
        },
    })
