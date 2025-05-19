import { PropsWithChildren, default as React } from "react"
import { StyleSheet, ViewStyle } from "react-native"
import { BaseText, BaseView } from "~Components/Base"
import { ColorThemeType } from "~Constants"
import { useTheme, useThemedStyles } from "~Hooks"

type Props = PropsWithChildren<{
    label?: string
    style?: ViewStyle
}>

export const OptionText = ({ children }: PropsWithChildren) => {
    const theme = useTheme()
    return (
        <BaseText typographyFont="body" color={theme.colors.textLight}>
            {children}
        </BaseText>
    )
}

export const Option = ({ label, children, style }: Props) => {
    const { styles } = useThemedStyles(baseStyles)
    return (
        <BaseView style={[styles.result, style]} gap={16} flexDirection="column">
            {label && <OptionText>{label}</OptionText>}
            {children}
        </BaseView>
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        result: {
            borderWidth: 1,
            borderColor: theme.colors.editSpeedBs.result.border,
            backgroundColor: theme.colors.editSpeedBs.result.background,
            padding: 24,
            borderRadius: 12,
        },
    })
