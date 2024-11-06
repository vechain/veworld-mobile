import React from "react"
import { BaseCard, BaseSpacer, BaseText, BaseView } from "~Components"
import { useI18nContext } from "~i18n"
import { LocalDevice } from "~Model"
import { LastBackupAlert } from "../index"
import { ManualBackupContent } from "~Screens/Flows/App/MnemonicBackupScreen/Components"
import { COLORS, ColorThemeType } from "~Constants"
import { StyleSheet } from "react-native"
import { useThemedStyles } from "~Hooks"

type Props = {
    mnemonicArray: string[]
    deviceToBackup?: LocalDevice
}

export const ManualBackup = ({ mnemonicArray, deviceToBackup }: Props) => {
    const { LL } = useI18nContext()
    const { styles } = useThemedStyles(baseStyles)

    return (
        <BaseView>
            {(deviceToBackup?.isBuckedUp || deviceToBackup?.isBackedUpOnCloud) && (
                <>
                    <LastBackupAlert deviceToBackup={deviceToBackup} />
                    <BaseSpacer height={24} />
                </>
            )}
            <BaseText typographyFont="subSubTitleMedium">{deviceToBackup?.alias}</BaseText>
            <BaseSpacer height={16} />
            <BaseText typographyFont="captionRegular">{LL.BD_MNEMONIC_PASSWORD_WARNING()}</BaseText>
            <BaseSpacer height={16} />
            <BaseCard containerStyle={styles.cardContainer} style={styles.card}>
                <ManualBackupContent mnemonicArray={mnemonicArray} deviceToBackup={deviceToBackup} />
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
