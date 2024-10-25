import React, { FC } from "react"
import { BaseSpacer, BaseText, BaseView } from "~Components"
import { ManualBackupCard } from "./ManualBackupCard"
import { CloudBackupCard } from "./CloudBackupCard"
import { LocalDevice } from "~Model"
import { useThemedStyles } from "~Hooks"
import { ColorThemeType } from "~Constants"
import { StyleSheet } from "react-native"
import { IsBackedupAlert } from "~Screens/Flows/App/MnemonicBackupScreen/Components"

type Props = {
    mnemonicArray: string[]
    deviceToBackup?: LocalDevice
}

export const CloudAndManualBackup: FC<Props> = ({ mnemonicArray, deviceToBackup }) => {
    const { styles } = useThemedStyles(baseStyles)
    return (
        <BaseView>
            <BaseText typographyFont="subSubTitleMedium">{deviceToBackup?.alias}</BaseText>
            {deviceToBackup?.isBuckedUp && (
                <>
                    <BaseSpacer height={16} />
                    <IsBackedupAlert />
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
            <ManualBackupCard mnemonicArray={mnemonicArray} />
        </BaseView>
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        container: {
            flexDirection: "row",
            alignItems: "center",
            width: 100,
        },
        line: {
            flex: 1,
            backgroundColor: theme.colors.placeholder,
        },
        text: {
            color: theme.colors.placeholder,
        },
    })
