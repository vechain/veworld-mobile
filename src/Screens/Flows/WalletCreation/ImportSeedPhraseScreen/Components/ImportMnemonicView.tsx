import { StyleSheet, TextInput } from "react-native"
import React from "react"

import { ColorThemeType, Theme, useThemedStyles } from "~Common"

const {
    typography: { defaults: defaultTypography },
} = Theme
type Props = {
    seed: string
    onChangeText: (text: string) => void
    isError: boolean
}

export const ImportMnemonicView = ({ seed, onChangeText, isError }: Props) => {
    const { styles: themedStyles } = useThemedStyles(baseStyles(isError))
    return (
        <TextInput
            style={themedStyles.container}
            autoCapitalize="none"
            autoComplete="off"
            multiline={true}
            numberOfLines={4}
            onChangeText={onChangeText}
            value={seed}
        />
    )
}

const baseStyles = (isError: boolean) => (theme: ColorThemeType) =>
    StyleSheet.create({
        container: {
            color: theme.colors.text,
            backgroundColor: theme.colors.card,
            borderColor: isError
                ? theme.colors.danger
                : theme.colors.transparent,
            borderWidth: 1,
            borderRadius: 8,
            paddingVertical: 20,
            paddingHorizontal: 10,
            height: 140,
            lineHeight: 28,
            fontSize: defaultTypography.bodyAccent.fontSize,
            fontFamily: defaultTypography.bodyAccent.fontFamily,
        },
    })
