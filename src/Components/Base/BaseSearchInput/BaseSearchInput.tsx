import React, { memo } from "react"
import { TextInput, StyleSheet } from "react-native"
import { useTheme, useThemedStyles } from "~Hooks"
import { typography, ColorThemeType, COLORS } from "~Constants"
import { BaseIcon } from "../BaseIcon"
import { BaseView } from "../BaseView"
const { defaults: defaultTypography } = typography

type Props = {
    placeholder?: string
    value?: string
    setValue?: (s: string) => void
    testID?: string
}

export const BaseSearchInput = memo(({ placeholder = "Search", value, setValue, testID }: Props) => {
    const { styles } = useThemedStyles(baseStyles)

    const theme = useTheme()

    const placeholderColor = theme.isDark ? COLORS.WHITE_DISABLED : COLORS.DARK_PURPLE_DISABLED

    return (
        <BaseView style={styles.container}>
            <TextInput
                // workarounds for android crashing when using the keyboard
                keyboardType="email-address"
                autoCorrect={false}
                style={styles.input}
                placeholder={placeholder}
                placeholderTextColor={placeholderColor}
                onChangeText={setValue}
                value={value}
                testID={testID}
            />
            <BaseIcon name="magnify" size={24} color={theme.colors.text} style={styles.icon} testID="magnify" />
        </BaseView>
    )
})

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        container: {
            width: "100%",
            flexDirection: "row",
            alignItems: "center",
            borderColor: theme.colors.transparent,
            borderWidth: 1,
            borderRadius: 16,
            backgroundColor: theme.colors.card,
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
