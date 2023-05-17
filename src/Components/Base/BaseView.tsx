import React, { memo, useMemo } from "react"
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
    w?: number // NOTE: this is a number in percentage
    h?: number // NOTE: this is a number in percentage
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
        justifyContent,
        alignItems,
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
        const computedAlignItems = useMemo(() => {
            if (alignItems) return alignItems
            if (flexDirection === "row") return "center"
            // TODO: this is WRONG!!!!, should be like the default View behavior (stretch)
            return "flex-start"
        }, [flexDirection, alignItems])

        const computedJustifyContent = useMemo(() => {
            if (justifyContent) return justifyContent
            if (flexDirection === "row") return "space-between"
            return "flex-start"
        }, [flexDirection, justifyContent])

        const { styles: themedStyles } = useThemedStyles(
            baseStyles({
                flex,
                flexGrow,
                alignSelf,
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
        },
    })
