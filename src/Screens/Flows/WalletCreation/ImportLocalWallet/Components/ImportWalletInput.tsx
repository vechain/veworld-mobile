import { StyleSheet, TextInput } from "react-native"
import React from "react"

import { useThemedStyles } from "~Hooks"
import { ColorThemeType, typography } from "~Constants"

const { defaults: defaultTypography } = typography
type Props = {
    value: string
    onChangeText: (text: string) => void
    isError: boolean
}

export const ImportWalletInput = ({ value, onChangeText, isError }: Props) => {
    const { styles: themedStyles } = useThemedStyles(baseStyles(isError))
    return (
        <TextInput
            style={themedStyles.container}
            autoCapitalize="none"
            placeholder="Enter your Mnemonic phrase, Private Key or Keystore file here"
            autoCorrect={false}
            autoComplete="off"
            multiline={true}
            numberOfLines={4}
            onChangeText={onChangeText}
            value={value}
            testID="import-input"
            keyboardType="ascii-capable"
        />
    )
}

const baseStyles = (isError: boolean) => (theme: ColorThemeType) =>
    StyleSheet.create({
        container: {
            width: "100%",
            color: theme.colors.text,
            backgroundColor: theme.colors.card,
            borderColor: isError ? theme.colors.danger : theme.colors.transparent,
            borderWidth: 1,
            borderRadius: 8,
            paddingVertical: 20,
            paddingHorizontal: 10,
            height: 180,
            lineHeight: 28,
            fontSize: defaultTypography.bodyAccent.fontSize,
            fontFamily: defaultTypography.bodyAccent.fontFamily,
        },
    })
