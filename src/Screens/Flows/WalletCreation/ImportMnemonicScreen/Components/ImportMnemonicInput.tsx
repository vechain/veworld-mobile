import { StyleSheet, TextInput } from "react-native"
import React from "react"

import { ColorThemeType, useThemedStyles } from "~Common"
import { typography } from "~Common/Theme"

const { defaults: defaultTypography } = typography
type Props = {
    mnemonic: string
    onChangeText: (text: string) => void
    isError: boolean
}

export const ImportMnemonicInput = ({
    mnemonic,
    onChangeText,
    isError,
}: Props) => {
    const { styles: themedStyles } = useThemedStyles(baseStyles(isError))
    return (
        <TextInput
            style={themedStyles.container}
            autoCapitalize="none"
            autoComplete="off"
            multiline={true}
            numberOfLines={4}
            onChangeText={onChangeText}
            value={mnemonic}
            testID="import-mnemonic-input"
        />
    )
}

const baseStyles = (isError: boolean) => (theme: ColorThemeType) =>
    StyleSheet.create({
        container: {
            width: "100%",
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
