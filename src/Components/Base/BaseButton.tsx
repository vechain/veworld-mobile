/* eslint-disable react-native/no-inline-styles */
import {
    TouchableOpacity,
    TouchableOpacityProps,
    StyleSheet,
    FlexAlignType,
} from "react-native"
import React from "react"
import { TFonts, useTheme } from "~Common"
import { BaseText } from "./BaseText"
import { LocalizedString } from "typesafe-i18n"

type Props = {
    action: () => void
    disabled?: boolean
    filled?: boolean
    bordered?: boolean
    title: LocalizedString | string
    m?: number
    mx?: number
    my?: number
    p?: number
    px?: number
    py?: number
    w?: number
    h?: number
    font?: TFonts
    selfAlign?: "auto" | FlexAlignType | undefined
} & TouchableOpacityProps

export const BaseButton = (props: Props) => {
    const { style, disabled = false, ...otherProps } = props
    const theme = useTheme()

    return (
        <TouchableOpacity
            onPress={props.action}
            activeOpacity={0.7}
            disabled={disabled}
            style={[
                {
                    backgroundColor: props.filled
                        ? theme.colors.button
                        : theme.constants.transparent,
                    borderColor: props.bordered
                        ? theme.colors.button
                        : theme.constants.transparent,
                    width: props.w && `${props.w}%`,
                    height: props.h && `${props.h}%`,
                    margin: props.m,
                    marginVertical: props.my,
                    marginHorizontal: props.mx,
                    padding: props.p,
                    paddingVertical: props.py ? props.py : 14,
                    paddingHorizontal: props.px,
                    opacity: disabled ? 0.5 : 1,
                    alignSelf: props.selfAlign,
                },
                style,
                baseStyle.default,
            ]}
            {...otherProps}>
            <BaseText
                color={
                    props.filled ? theme.colors.background : theme.colors.button
                }
                font={props.font ? props.font : "body_accent"}>
                {props.title}
            </BaseText>
        </TouchableOpacity>
    )
}

const baseStyle = StyleSheet.create({
    default: {
        borderRadius: 8,
        borderWidth: 1,
        alignItems: "center",
    },
})
