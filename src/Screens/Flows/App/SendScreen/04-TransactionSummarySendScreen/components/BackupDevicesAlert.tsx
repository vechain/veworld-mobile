import { useNavigation } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import React from "react"
import { StyleSheet } from "react-native"
import { BaseButton, BaseIcon, BaseSpacer, BaseText, BaseView } from "~Components"
import { ColorThemeType } from "~Constants"
import { useCheckWalletBackup, useThemedStyles } from "~Hooks"
import { useI18nContext } from "~i18n"
import { RootStackParamListHome, Routes } from "~Navigation"
import { selectSelectedAccount, useAppSelector } from "~Storage/Redux"

export const BackupDevicesAlert = () => {
    const { LL } = useI18nContext()
    const { styles } = useThemedStyles(baseStyles)
    const naigation = useNavigation<NativeStackNavigationProp<RootStackParamListHome>>()

    const selectedAccount = useAppSelector(selectSelectedAccount)
    const isBackupNeeded = useCheckWalletBackup(selectedAccount)

    const goToPrivacyScreen = () => {
        naigation.navigate(Routes.SETTINGS_PRIVACY)
    }

    return isBackupNeeded ? (
        <BaseView style={styles.rootContainer}>
            <BaseView style={styles.cardContainer}>
                <BaseIcon name="alert-outline" color={"#E53E3E"} />
                <BaseSpacer width={8} />
                <BaseView style={styles.cardTextContainer}>
                    <BaseText typographyFont="bodyMedium" color="#9B2C2C">
                        {LL.BACKUP_YOUR_DEVICES_TITLE()}
                    </BaseText>
                    <BaseSpacer width={4} />
                    <BaseText typographyFont="captionRegular" color="#4A5568">
                        {LL.BACKUP_YOUR_DEVICES_DESCRIPTION()}
                    </BaseText>
                </BaseView>
            </BaseView>
            <BaseSpacer height={12} />
            <BaseButton
                accessible
                variant="outline"
                size="lg"
                haptics="Medium"
                w={100}
                title={LL.BACKUP_YOUR_DEVICES_CTA()}
                action={goToPrivacyScreen}
                activeOpacity={0.94}
            />
        </BaseView>
    ) : null
}

const baseStyles = (theme: ColorThemeType) => {
    return StyleSheet.create({
        rootContainer: {
            borderRadius: 16,
            padding: 16,
            backgroundColor: theme.colors.card,
            marginBottom: 24,
        },
        cardContainer: {
            borderRadius: 8,
            borderWidth: 1,
            paddingHorizontal: 16,
            paddingVertical: 12,
            flexDirection: "row",
            borderColor: "#FEB2B2",
            backgroundColor: "#FFF5F5",
        },
        cardTextContainer: {
            flex: 1,
        },
    })
}
