import { useNavigation } from "@react-navigation/native"
import React from "react"
import { StyleSheet } from "react-native"
import { BaseIcon, BaseText, BaseTouchableBox, BaseView } from "~Components"
import { ColorThemeType } from "~Constants"
import { useThemedStyles } from "~Hooks"
import { useI18nContext } from "~i18n"
import { Routes } from "~Navigation"
import { StringUtils } from "~Utils"

export const NotificationBox = () => {
    const { styles, theme } = useThemedStyles(baseStyle)
    const { LL } = useI18nContext()
    const navigation = useNavigation()

    const goToSettingsNotificationScreen = () => {
        navigation.navigate(Routes.SETTINGS_NOTIFICATIONS)
    }

    return (
        <BaseView style={styles.touchableContainer} flexDirection="row" accessible={false}>
            <BaseTouchableBox haptics="Light" action={goToSettingsNotificationScreen}>
                <BaseView flexDirection="row" justifyContent="space-between" alignItems="center" flex={1}>
                    <BaseView flexDirection="column" alignItems="flex-start" style={styles.rightIcon}>
                        <BaseView flexDirection="row">
                            <BaseText typographyFont="button" ellipsizeMode="tail" numberOfLines={1}>
                                {StringUtils.capitalize(LL.PUSH_NOTIFICATIONS())}
                            </BaseText>
                        </BaseView>
                        <BaseText pt={2} typographyFont="captionMedium">
                            {LL.PUSH_NOTIFICATIONS_DESC()}
                        </BaseText>
                    </BaseView>
                    <BaseIcon name={"chevron-right"} color={theme.colors.text} />
                </BaseView>
            </BaseTouchableBox>
        </BaseView>
    )
}

const baseStyle = (theme: ColorThemeType) =>
    StyleSheet.create({
        touchableContainer: {
            backgroundColor: theme.colors.card,
            borderRadius: 16,
        },
        rightIcon: {
            width: "90%",
        },
    })
