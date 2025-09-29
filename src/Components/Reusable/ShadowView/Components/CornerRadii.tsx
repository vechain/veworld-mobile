//https://github.com/ShinMini/react-native-inner-shadow/blob/main/src/components/CornerRadii.tsx
import { RoundedRect, type InputRRect } from "@shopify/react-native-skia"
import React from "react"

import type { ViewStyle } from "react-native"
import type { SharedValue } from "react-native-reanimated"
import { getBorderRadius } from "../Utils"
import { CANVAS_PADDING } from "../Utils/constants"

type CornerRadiiProps = {
    width: number
    height: number
    style?: ViewStyle
    backgroundColor: SharedValue<string> | string
    children?: React.ReactNode
}
export const CornerRadii = React.memo(function CornerRadii({
    width,
    height,
    style,
    children,
    backgroundColor,
}: CornerRadiiProps) {
    const rrct = React.useMemo(() => {
        const { topLeftRadius, topRightRadius, bottomRightRadius, bottomLeftRadius } = getBorderRadius({
            borderRadius: style?.borderRadius,
            borderTopStartRadius: style?.borderTopStartRadius,
            borderTopLeftRadius: style?.borderTopLeftRadius,
            borderTopEndRadius: style?.borderTopEndRadius,
            borderTopRightRadius: style?.borderTopRightRadius,
            borderBottomStartRadius: style?.borderBottomStartRadius,
            borderBottomLeftRadius: style?.borderBottomLeftRadius,
            borderBottomEndRadius: style?.borderBottomEndRadius,
            borderBottomRightRadius: style?.borderBottomRightRadius,
        })

        return {
            rect: {
                x: CANVAS_PADDING,
                y: CANVAS_PADDING,
                width: width,
                height: height,
            },
            topLeft: { x: topLeftRadius, y: topLeftRadius },
            topRight: { x: topRightRadius, y: topRightRadius },
            bottomRight: { x: bottomRightRadius, y: bottomRightRadius },
            bottomLeft: { x: bottomLeftRadius, y: bottomLeftRadius },
        } satisfies InputRRect
    }, [
        width,
        height,
        style?.borderRadius,
        style?.borderTopStartRadius,
        style?.borderTopLeftRadius,
        style?.borderTopEndRadius,
        style?.borderTopRightRadius,
        style?.borderBottomStartRadius,
        style?.borderBottomLeftRadius,
        style?.borderBottomEndRadius,
        style?.borderBottomRightRadius,
    ])

    return (
        <RoundedRect rect={rrct} color={backgroundColor}>
            {children}
        </RoundedRect>
    )
})
