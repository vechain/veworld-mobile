import {
    StyleSheet,
    TextProps,
    TouchableOpacity,
    TouchableOpacityProps,
} from "react-native"
import React from "react"
import { BaseText } from "./BaseText"
import { TFonts } from "~Constants"

type Props = {
    title?: string
    action?: () => void
    underlined?: boolean
    font?: TFonts
} & TouchableOpacityProps &
    TextProps

export const BaseTouchable = (props: Props) => {
    const {
        action,
        title,
        underlined,
        style,
        children,
        font = "bodyMedium",
        ...otherProps
    } = props

    return (
        <TouchableOpacity
            onPress={action ? action : undefined}
            style={style}
            {...otherProps}>
            {title && (
                <BaseText
                    typographyFont={font}
                    style={underlined && baseStyles.underline}>
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
