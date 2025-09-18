//https://github.com/ShinMini/react-native-inner-shadow/blob/main/src/components/ShadowLinearGradientFill.tsx
import { LinearGradient } from "@shopify/react-native-skia"
import React from "react"
import { getLinearDirection } from "../Utils"
import type { LinearInnerShadowProps } from "../Utils/types"

/**
 * Internal helper component that draws the linear gradient.
 * You can rename this to "LinearGradientFill" or similar if you prefer.
 */
export default function LinearGradientFill({
    width = 0,
    height = 0,
    from = "top",
    to = "bottom",
    colors,
}: LinearInnerShadowProps) {
    const { start, end } = React.useMemo(
        () => getLinearDirection({ width, height, from, to }),
        [width, height, from, to],
    )

    return <LinearGradient start={start} end={end} colors={colors} />
}
