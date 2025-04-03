import React, { memo, useMemo } from "react"
import { StyleSheet, View, ViewProps } from "react-native"

import { AlignItems, AlignSelf, ColorThemeType, FlexDirection, FlexWrap, JustifyContent, Overflow } from "~Constants"
import { useThemedStyles } from "~Hooks"

export type BaseViewProps = {
    w?: number // NOTE: this is a number in percentage
    h?: number // NOTE: this is a number in percentage
    bg?: string
    flexDirection?: FlexDirection
    justifyContent?: JustifyContent
    alignItems?: AlignItems
    alignSelf?: AlignSelf
    overflow?: Overflow
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
    gap?: number
} & ViewProps

export const BaseView = memo(
    ({
        style,
        flex = 0,
        flexDirection = "column",
        justifyContent,
        alignItems,
        flexWrap,
        flexGrow,
        alignSelf,
        overflow,
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
        gap,
        ...otherProps
    }: BaseViewProps) => {
        const computedAlignItems = useMemo(() => {
            if (alignItems) return alignItems
            if (flexDirection === "row") return "center"
            return "stretch"
        }, [flexDirection, alignItems])

        const computedJustifyContent = useMemo(() => {
            if (justifyContent) return justifyContent
            if (flexDirection === "row") return "flex-start"
            return "flex-start"
        }, [flexDirection, justifyContent])

        const { styles: themedStyles } = useThemedStyles(
            baseStyles({
                flex,
                flexGrow,
                alignSelf,
                overflow,
                flexDirection,
                justifyContent: computedJustifyContent,
                alignItems: computedAlignItems,
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
                gap,
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
    overflow?: Overflow
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
    gap?: number
}

const baseStyles = (props: BaseStyles) => (theme: ColorThemeType) =>
    StyleSheet.create({
        view: {
            flex: props.flex,
            flexWrap: props.flexWrap,
            flexDirection: props.flexDirection,
            justifyContent: props.justifyContent,
            alignItems: props.alignItems,
            flexGrow: props.flexGrow,
            alignSelf: props.alignSelf,
            overflow: props.overflow,
            backgroundColor: props.bg || theme.colors.transparent,
            width: props.w && `${props.w}%`,
            height: props.h && `${props.h}%`,
            margin: props.m,
            marginVertical: props.my,
            marginHorizontal: props.mx,
            marginLeft: props.ml,
            marginRight: props.mr,
            marginBottom: props.mb,
            marginTop: props.mt,
            padding: props.p,
            paddingVertical: props.py,
            paddingHorizontal: props.px,
            paddingLeft: props.pl,
            paddingRight: props.pr,
            paddingBottom: props.pb,
            paddingTop: props.pt,
            borderRadius: props.borderRadius,
            gap: props.gap,
        },
    })
