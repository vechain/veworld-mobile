import { StyleSheet, TextProps, TouchableOpacity, TouchableOpacityProps } from "react-native"
import React, { useCallback } from "react"
import { BaseText } from "./BaseText"
import { TFonts } from "~Constants"
import HapticsService from "~Services/HapticsService"

type Props = {
    title?: string
    action?: () => void
    underlined?: boolean
    font?: TFonts
    children?: React.ReactNode
    haptics?: "Success" | "Warning" | "Error" | "Light" | "Medium" | "Heavy"
} & TouchableOpacityProps &
    TextProps

export const BaseTouchable = (props: Props) => {
    const { action, title, underlined, style, children, font = "bodyMedium", haptics, ...otherProps } = props

    const onButtonPress = useCallback(() => {
        if (!action) return
        action()
        haptics && HapticsService.triggerHaptics({ haptics })
    }, [action, haptics])

    return (
        <TouchableOpacity onPress={onButtonPress} style={style} {...otherProps}>
            {title && (
                <BaseText typographyFont={font} style={underlined && baseStyles.underline}>
                    {title}
                </BaseText>
            )}
            {children}
        </TouchableOpacity>
    )
}

const baseStyles = StyleSheet.create({
    underline: {
        textDecorationLine: "underline",
    },
})
