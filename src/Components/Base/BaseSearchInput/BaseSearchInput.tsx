import React, { memo } from "react"
import { TextInput, View, StyleSheet } from "react-native"
import DropShadow from "react-native-drop-shadow"
import { ColorThemeType, useTheme, useThemedStyles } from "~Common"
import { typography } from "~Common/Theme"
import { BaseIcon } from "../BaseIcon"
const { defaults: defaultTypography } = typography

type Props = {
    placeholder?: string
    value?: string
    setValue?: (s: string) => void
}

export const BaseSearchInput = memo(
    ({ placeholder = "Search", value, setValue }: Props) => {
        const { styles } = useThemedStyles(baseStyles)

        const theme = useTheme()

        return (
            <View style={styles.container}>
                <DropShadow style={styles.container}>
                    <TextInput
                        style={styles.input}
                        placeholder={placeholder}
                        placeholderTextColor={theme.colors.text}
                        onChangeText={setValue}
                        value={value}
                    />
                    <BaseIcon
                        name="magnify"
                        size={24}
                        color={theme.colors.text}
                        style={styles.icon}
                        testID="magnify"
                    />
                </DropShadow>
            </View>
        )
    },
)

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        container: {
            ...theme.shadows.card,
            width: "100%",
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "#fff",
            borderRadius: 16,
        },
        input: {
            flex: 1,
            color: theme.colors.text,
            backgroundColor: theme.colors.card,
            borderColor: theme.colors.transparent,
            borderWidth: 1,
            borderRadius: 16,
            fontSize: defaultTypography.body.fontSize,
            fontFamily: defaultTypography.body.fontFamily,
            paddingVertical: 12,
            paddingLeft: 16,
            paddingRight: 8,
        },
        icon: {
            paddingVertical: 12,
            paddingLeft: 8,
            paddingRight: 16,
        },
    })
