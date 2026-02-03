import { StyleSheet, TextInput } from "react-native"
import React from "react"

import { useThemedStyles } from "~Hooks"
import { ColorThemeType } from "~Constants"
import { COLORS, typography } from "~Constants/Theme"
import FontUtils from "~Utils/FontUtils"
import { useI18nContext } from "~i18n"

const { defaults: defaultTypography } = typography
type Props = {
    value: string
    onChangeText: (text: string) => void
    isError: boolean
}

export const ImportWalletInput = ({ value, onChangeText, isError }: Props) => {
    const { styles: themedStyles } = useThemedStyles(baseStyles(isError))
    const { LL } = useI18nContext()
    return (
        <TextInput
            style={themedStyles.container}
            autoCapitalize="none"
            placeholder={LL.WALLET_IMPORT_TEXT_INPUT_PLACEHOLDER()}
            placeholderTextColor={COLORS.GREY_400}
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

const baseStyles = (isError: boolean) => (theme: ColorThemeType) => {
    const containerBorderColor = theme.isDark ? COLORS.PURPLE : COLORS.GREY_200
    return StyleSheet.create({
        container: {
            width: "100%",
            color: theme.colors.text,
            backgroundColor: theme.isDark ? COLORS.PURPLE_DISABLED : COLORS.WHITE,
            borderColor: isError ? theme.colors.danger : containerBorderColor,
            borderWidth: 1,
            borderRadius: 8,
            padding: 16,
            height: 150,
            lineHeight: 20,
            fontSize: FontUtils.font(defaultTypography.body.fontSize),
            fontFamily: defaultTypography.body.fontFamily,
        },
    })
}
