import {
    StyleSheet,
    TouchableOpacity,
    TouchableOpacityProps,
} from "react-native"
import React from "react"
import { LocalizedString } from "typesafe-i18n"
import { BaseText } from "./BaseText"

type Props = {
    title: LocalizedString
    action: () => void
    underlined?: boolean
} & TouchableOpacityProps

export const BaseTouchable = (props: Props) => {
    const { action, title, underlined, style, ...otherProps } = props

    return (
        <TouchableOpacity onPress={action} style={style} {...otherProps}>
            <BaseText
                typographyFont="bodyMedium"
                style={underlined && baseStyles.underline}>
                {title}
            </BaseText>
        </TouchableOpacity>
    )
}

const baseStyles = StyleSheet.create({
    underline: {
        textDecorationLine: "underline",
    },
})
