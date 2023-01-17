/* eslint-disable react-native/no-inline-styles */
import React, { useMemo } from "react"
import { FlexAlignType, Text, TextProps } from "react-native"
import { TFonts, useTheme } from "~Common"
import { BaseView } from "./BaseView"

type Props = {
    font?: TFonts
    align?: "left" | "center" | "right"
    italic?: boolean
    color?: string
    isButton?: boolean
    m?: number
    mx?: number
    my?: number
    p?: number
    px?: number
    py?: number
    w?: number
    h?: number
    alignContainer?: FlexAlignType
    justifyContainer?:
        | "flex-start"
        | "flex-end"
        | "center"
        | "space-between"
        | "space-around"
        | "space-evenly"
} & TextProps

export const BaseText = (props: Props) => {
    const { style, ...otherProps } = props
    const theme = useTheme()

    const computeFont = useMemo(
        () => theme.typography[props.font ?? "body"].fontSize,
        [props.font, theme.typography],
    )

    const computeFamily = useMemo(
        () => theme.typography[props.font ?? "body"].fontFamily,
        [props.font, theme.typography],
    )

    return (
        <BaseView
            align={props.alignContainer}
            justify={props.justifyContainer}
            m={props.m}
            mx={props.mx}
            my={props.my}
            p={props.p}
            px={props.px}
            py={props.py}
            w={props.w}
            h={props.h}>
            <Text
                style={[
                    {
                        color: props.color ? props.color : theme.colors.text,
                        fontSize: computeFont,
                        fontFamily: computeFamily,
                        textAlign: props.align,
                        fontStyle: props.italic ? "italic" : "normal",
                    },
                    style,
                ]}
                {...otherProps}
            />
        </BaseView>
    )
}
