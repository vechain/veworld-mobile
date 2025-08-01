/* eslint-disable react-native/no-inline-styles */
import React, { useMemo } from "react"
import { FlexAlignType, Text, TextProps, TextStyle, ViewStyle } from "react-native"
import { typography } from "~Constants/Theme"
import { useTheme } from "~Hooks"
import { BaseView, BaseViewProps } from "./BaseView"

const { defaults: defaultTypography, ...otherTypography } = typography

export type BaseTextProps = {
    typographyFont?: keyof typeof defaultTypography
    fontSize?: keyof typeof otherTypography.fontSize
    fontWeight?: keyof typeof otherTypography.fontWeight
    fontFamily?: keyof typeof otherTypography.fontFamily
    lineHeight?: number
    align?: "left" | "center" | "right"
    italic?: boolean
    underline?: boolean
    color?: string
    isButton?: boolean
    m?: number
    mx?: number
    my?: number
    mb?: number
    mt?: number
    p?: number
    px?: number
    py?: number
    pb?: number
    pt?: number
    pl?: number
    pr?: number
    w?: number
    h?: number
    bg?: string
    borderRadius?: number
    alignContainer?: FlexAlignType
    justifyContainer?: "flex-start" | "flex-end" | "center" | "space-between" | "space-around" | "space-evenly"
    textTransform?: TextStyle["textTransform"]
    containerStyle?: ViewStyle
} & TextProps &
    Pick<BaseViewProps, "flex" | "flexGrow" | "flexShrink" | "flexDirection">

export const BaseText = (props: BaseTextProps) => {
    const {
        style,
        typographyFont,
        fontSize,
        fontWeight,
        fontFamily,
        lineHeight,
        textTransform,
        containerStyle,
        ...otherProps
    } = props
    const theme = useTheme()

    const computedFontSize = useMemo(
        () =>
            fontSize ??
            (((typographyFont &&
                defaultTypography[typographyFont].fontSize) as keyof typeof otherTypography.fontSize) ||
                14),
        [typographyFont, fontSize],
    )

    const computedFontWeight = useMemo(
        () =>
            fontWeight ??
            (((typographyFont &&
                defaultTypography[typographyFont].fontWeight) as keyof typeof otherTypography.fontWeight) ||
                "500"),
        [typographyFont, fontWeight],
    )

    const computedFontFamily = useMemo(
        () =>
            fontFamily ??
            (((typographyFont &&
                defaultTypography[typographyFont].fontFamily) as keyof typeof otherTypography.fontFamily) ||
                "Inter-Regular"),
        [typographyFont, fontFamily],
    )

    return (
        <BaseView
            alignItems={props.alignContainer}
            justifyContent={props.justifyContainer}
            m={props.m}
            mx={props.mx}
            my={props.my}
            mt={props.mt}
            mb={props.mb}
            p={props.p}
            px={props.px}
            py={props.py}
            pb={props.pb}
            pt={props.pt}
            pl={props.pl}
            pr={props.pr}
            w={props.w}
            borderRadius={props.borderRadius}
            bg={props.bg}
            h={props.h}
            flex={props.flex}
            flexGrow={props.flexGrow}
            flexShrink={props.flexShrink}
            flexDirection={props.flexDirection}
            style={containerStyle}>
            <Text
                style={[
                    {
                        color: props.color ?? theme.colors.text,
                        fontSize: computedFontSize,
                        fontFamily: computedFontFamily,
                        fontWeight: computedFontWeight,
                        textAlign: props.align,
                        fontStyle: props.italic ? "italic" : "normal",
                        textDecorationLine: props.underline ? "underline" : "none",
                        textTransform,
                        lineHeight:
                            lineHeight ?? (typographyFont ? defaultTypography[typographyFont].lineHeight : undefined),
                    },
                    style,
                ]}
                {...otherProps}
            />
        </BaseView>
    )
}
