import { BaseCard, BaseSpacer, BaseView, MnemonicCard } from "~Components"
import { DoNotShareAlert } from "~Screens/Flows/App/MnemonicBackupScreen/Components"
import React, { memo } from "react"
import { useThemedStyles } from "~Hooks"
import { COLORS, ColorThemeType } from "~Constants"
import { StyleSheet } from "react-native"
import { LocalDevice } from "~Model"
import { CopyRecoveryPhraseButton } from "~Screens/Flows/App/MnemonicBackupScreen/Components/CopyRecoveryPhraseButton"

type Props = {
    mnemonicArray: string[]
    deviceToBackup?: LocalDevice
}

export const ManualOnlyBackupCard = memo(({ mnemonicArray, deviceToBackup }: Props) => {
    const { styles } = useThemedStyles(baseStyles)

    return (
        <BaseCard containerStyle={styles.cardContainer} style={styles.card}>
            <BaseView px={18} py={16}>
                <DoNotShareAlert />
                <BaseSpacer height={12} />
                {!!mnemonicArray.length && (
                    <MnemonicCard
                        mnemonicArray={mnemonicArray}
                        souceScreen="BackupMnemonicBottomSheet"
                        deviceToBackup={deviceToBackup}
                    />
                )}
                <BaseSpacer height={16} />
                <CopyRecoveryPhraseButton mnemonicArray={mnemonicArray} deviceToBackup={deviceToBackup} />
            </BaseView>
        </BaseCard>
    )
})

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        card: {
            display: "flex",
            flexDirection: "column",
            alignContent: "center",
            paddingVertical: 0,
        },
        cardContainer: {
            display: "flex",
            alignItems: "center",
            borderWidth: 1,
            borderRadius: 12,
            borderColor: theme.isDark ? COLORS.DARK_PURPLE_DISABLED : theme.colors.cardBorder,
        },
    })
