import { useNavigation } from "@react-navigation/native"
import React, { useCallback } from "react"
import { StyleSheet } from "react-native"
import { LocalizedString } from "typesafe-i18n"
import { useTheme } from "~Hooks"
import { BaseIcon, BaseText, BaseTouchable, BaseView } from "~Components"
import { RootStackParamListSettings } from "~Navigation"

export type RowProps = {
    title: LocalizedString
    screenName: keyof RootStackParamListSettings
    icon: string
}

export const SettingsRow = ({ title, screenName, icon }: RowProps) => {
    const nav = useNavigation()

    const theme = useTheme()

    const onPress = useCallback(
        () => nav.navigate(screenName),
        [screenName, nav],
    )

    return (
        <BaseTouchable
            action={onPress}
            style={baseStyles.container}
            haptics="Light">
            <BaseView flexDirection="row">
                <BaseIcon color={theme.colors.text} name={icon} size={24} />
                <BaseText
                    mx={14}
                    typographyFont="button"
                    color={theme.colors.text}>
                    {title}
                </BaseText>
            </BaseView>

            <BaseIcon
                color={theme.colors.text}
                name={"chevron-right"}
                size={24}
            />
        </BaseTouchable>
    )
}

const baseStyles = StyleSheet.create({
    container: {
        height: 56,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
})
