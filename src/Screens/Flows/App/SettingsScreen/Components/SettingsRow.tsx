import { useNavigation } from "@react-navigation/native"
import React, { useCallback } from "react"
import { StyleSheet } from "react-native"
import { Pressable } from "react-native"
import { LocalizedString } from "typesafe-i18n"
import { BaseIcon, BaseText, BaseView } from "~Components"

export type RowProps = {
    title: LocalizedString
    screenName: string
    icon: string
}

export const SettingsRow = ({ title, screenName, icon }: RowProps) => {
    const nav = useNavigation()

    const onPress = useCallback(
        // Todo: types
        () => nav.navigate(screenName),
        [screenName, nav],
    )

    return (
        <Pressable onPress={onPress} style={baseStyles.container}>
            <BaseView orientation="row" align="center">
                <BaseIcon name={icon} size={24} />
                <BaseText mx={14}>{title}</BaseText>
            </BaseView>

            <BaseIcon name={"chevron-right"} size={24} />
        </Pressable>
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
