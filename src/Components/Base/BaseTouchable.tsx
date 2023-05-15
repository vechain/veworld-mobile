import {
    StyleSheet,
    TouchableOpacity,
    TouchableOpacityProps,
} from "react-native"
import React from "react"
import { BaseText } from "./BaseText"

type Props = {
    title?: string
    action?: () => void
    underlined?: boolean
} & TouchableOpacityProps

export const BaseTouchable = (props: Props) => {
    const { action, title, underlined, style, children, ...otherProps } = props

    return (
        <TouchableOpacity
            onPress={action ? action : undefined}
            style={style}
            {...otherProps}>
            {title && (
                <BaseText
                    typographyFont="bodyMedium"
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
