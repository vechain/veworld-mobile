import { StyleSheet, TextInput } from "react-native"
import React from "react"
import { useTheme } from "~Common"

type Props = {
    seed: string
    onChangeText: (text: string) => void
    isError: boolean
}

export const ImportMnemonicView = ({ seed, onChangeText, isError }: Props) => {
    const theme = useTheme()

    return (
        <TextInput
            style={[
                baseStyles.container,
                // eslint-disable-next-line react-native/no-inline-styles
                {
                    borderColor: isError ? "red" : "black",
                    fontSize: theme.typography.body_accent.fontSize,
                    fontFamily: theme.typography.body_accent.fontFamily,
                },
            ]}
            autoCapitalize="none"
            autoComplete="off"
            multiline={true}
            numberOfLines={4}
            onChangeText={onChangeText}
            value={seed}
        />
    )
}

const baseStyles = StyleSheet.create({
    container: {
        borderWidth: 1,
        borderRadius: 8,
        paddingVertical: 20,
        paddingHorizontal: 10,
        height: 140,
        lineHeight: 28,
    },
})
