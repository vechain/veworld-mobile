/* eslint-disable react-native/no-inline-styles */
import React, { memo } from "react"
import { FlexAlignType, View, ViewProps } from "react-native"
import { useTheme } from "~Common"

type Props = {
    w?: number
    h?: number
    background?: string
    orientation?: "row" | "column"
    justify?:
        | "flex-start"
        | "flex-end"
        | "center"
        | "space-between"
        | "space-around"
        | "space-evenly"
    align?: "flex-start" | "flex-end" | "center" | "stretch" | "baseline"
    selfAlign?: "auto" | FlexAlignType
    m?: number
    mx?: number
    my?: number
    p?: number
    px?: number
    py?: number
    isFlex?: boolean
    grow?: number
    wrap?: boolean
    radius?: number
} & ViewProps

export const BaseView = memo((props: Props) => {
    const { style, ...otherProps } = props
    const theme = useTheme()

    return (
        <View
            style={[
                {
                    flex: props.isFlex ? 1 : 0,
                    flexWrap: props.wrap ? "wrap" : "nowrap",
                    flexDirection: props.orientation
                        ? props.orientation
                        : "column",
                    justifyContent: props.justify,
                    alignItems: props.align,
                    flexGrow: props.grow,
                    alignSelf: props.selfAlign,
                    backgroundColor: props.background
                        ? props.background
                        : theme.colors.transparent,
                    width: props.w && `${props.w}%`,
                    height: props.h && `${props.h}%`,
                    margin: props.m,
                    marginVertical: props.my,
                    marginHorizontal: props.mx,
                    padding: props.p,
                    paddingVertical: props.py,
                    paddingHorizontal: props.px,
                    borderRadius: props.radius || 0,
                },
                style,
            ]}
            {...otherProps}
        />
    )
})
