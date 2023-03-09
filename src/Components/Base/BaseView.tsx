import React, { memo } from "react"
import { StyleSheet, View, ViewProps } from "react-native"
import {
    AlignItems,
    AlignSelf,
    FlexWrap,
    FlexDirection,
    JustifyContent,
    ColorThemeType,
    useThemedStyles,
} from "~Common"

type Props = {
    w?: number
    h?: number
    bg?: string
    flexDirection?: FlexDirection
    justifyContent?: JustifyContent
    alignItems?: AlignItems
    alignSelf?: AlignSelf
    flexWrap?: FlexWrap
    flex?: number
    flexGrow?: number
    m?: number
    ml?: number
    mr?: number
    mx?: number
    mt?: number
    mb?: number
    my?: number
    p?: number
    pt?: number
    pb?: number
    px?: number
    pl?: number
    pr?: number
    py?: number
    borderRadius?: number
} & ViewProps

export const BaseView = memo(
    ({
        style,
        flex = 0,
        flexDirection = "column",
        justifyContent = "flex-start",
        alignItems = "center",
        flexWrap,
        flexGrow,
        alignSelf,
        bg,
        w,
        h,
        borderRadius = 0,
        p,
        px,
        py,
        pl,
        pr,
        pb,
        pt,
        m,
        mx,
        my,
        ml,
        mr,
        mb,
        mt,
        ...otherProps
    }: Props) => {
        const { styles: themedStyles } = useThemedStyles(
            baseStyles({
                flex,
                flexGrow,
                alignSelf,
                flexDirection,
                justifyContent,
                alignItems,
                flexWrap,
                bg,
                borderRadius,
                w,
                h,
                p,
                px,
                py,
                pl,
                pr,
                pb,
                pt,
                m,
                mx,
                my,
                ml,
                mr,
                mb,
                mt,
            }),
        )

        return <View style={[themedStyles.view, style]} {...otherProps} />
    },
)

type BaseStyles = {
    flex: number
    flexGrow?: number
    flexDirection: FlexDirection
    justifyContent: JustifyContent
    alignItems: AlignItems
    flexWrap?: FlexWrap
    alignSelf?: AlignSelf
    bg?: string
    w?: number
    h?: number
    m?: number
    ml?: number
    mr?: number
    mx?: number
    mt?: number
    mb?: number
    my?: number
    p?: number
    pt?: number
    pb?: number
    px?: number
    pl?: number
    pr?: number
    py?: number
    borderRadius?: number
}
const baseStyles =
    ({
        flex,
        flexGrow,
        alignSelf,
        flexDirection,
        justifyContent,
        alignItems,
        flexWrap,
        bg,
        w,
        h,
        p,
        px,
        py,
        pl,
        pr,
        pb,
        pt,
        m,
        mx,
        my,
        mr,
        ml,
        mb,
        mt,
        borderRadius,
    }: BaseStyles) =>
    (theme: ColorThemeType) =>
        StyleSheet.create({
            view: {
                flex,
                flexWrap,
                flexDirection,
                justifyContent,
                alignItems,
                flexGrow,
                alignSelf,
                backgroundColor: bg || theme.colors.transparent,
                width: w && `${w}%`,
                height: h && `${h}%`,
                margin: m,
                marginVertical: my,
                marginHorizontal: mx,
                marginLeft: ml,
                marginRight: mr,
                marginBottom: mb,
                marginTop: mt,
                padding: p,
                paddingVertical: py,
                paddingHorizontal: px,
                paddingLeft: pl,
                paddingRight: pr,
                paddingBottom: pb,
                paddingTop: pt,
                borderRadius,
            },
        })
