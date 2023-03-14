/* eslint-disable react-native/no-inline-styles */
import React, { useMemo } from "react"
import { FlexAlignType, Text, TextProps } from "react-native"
import { useTheme, Theme } from "~Common"
import { BaseView } from "./BaseView"

const {
    typography: { defaults: defaultTypography, ...otherTypography },
} = Theme

type Props = {
    typographyFont?: keyof typeof defaultTypography
    fontSize?: keyof typeof otherTypography.fontSize
    fontWeight?: keyof typeof otherTypography.fontWeight
    fontFamily?: keyof typeof otherTypography.fontFamily
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
    const {
        style,
        typographyFont,
        fontSize,
        fontWeight,
        fontFamily,
        ...otherProps
    } = props
    const theme = useTheme()

    const computedFontSize = useMemo(
        () =>
            fontSize ||
            ((typographyFont &&
                defaultTypography[typographyFont]
                    .fontSize) as keyof typeof otherTypography.fontSize) ||
            14,
        [typographyFont, fontSize],
    )

    const computedFontWeight = useMemo(
        () =>
            fontWeight ||
            ((typographyFont &&
                defaultTypography[typographyFont]
                    .fontWeight) as keyof typeof otherTypography.fontWeight) ||
            "500",
        [typographyFont, fontWeight],
    )

    const computedFontFamily = useMemo(
        () =>
            fontFamily ||
            ((typographyFont &&
                defaultTypography[typographyFont]
                    .fontFamily) as keyof typeof otherTypography.fontFamily) ||
            "Inter-Regular",
        [typographyFont, fontFamily],
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
                        color: props.color || theme.colors.text,
                        fontSize: computedFontSize,
                        fontFamily: computedFontFamily,
                        fontWeight: computedFontWeight,
                        textAlign: props.align,
                        fontStyle: props.italic ? "italic" : "normal",
                        lineHeight: typographyFont
                            ? defaultTypography[typographyFont].lineHeight
                            : undefined,
                    },
                    style,
                ]}
                {...otherProps}
            />
        </BaseView>
    )
}
