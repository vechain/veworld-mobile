import React, { memo, useMemo } from "react"
import { StyleSheet, ViewProps } from "react-native"

/*
    if USE_FAST_REACT react will bumdle a bare version of <Text> component 
    without a lot of extra (mostly never used) features for performance improvements
*/
const View = USE_FAST_REACT
    ? require("react-native/Libraries/Components/View/ViewNativeComponent")
          .default
    : require("react-native").View

import {
    AlignItems,
    AlignSelf,
    FlexWrap,
    FlexDirection,
    JustifyContent,
    ColorThemeType,
    USE_FAST_REACT,
} from "~Constants"
import { useThemedStyles } from "~Hooks"

export type BaseViewProps = {
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
