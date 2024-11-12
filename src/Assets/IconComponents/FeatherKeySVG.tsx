import React from "react"
import Svg, { Path, SvgProps } from "react-native-svg"

interface FeatherKeySVGProps extends Omit<SvgProps, "width" | "height"> {
    size?: number
    width?: number
    height?: number
}

const DEFAULT_SIZE = 24

export const FeatherKeySVG = ({
    size = DEFAULT_SIZE,
    width,
    height,
    color = "#000000",
    strokeWidth = 2,
    ...props
}: FeatherKeySVGProps) => {
    return (
        <Svg
            viewBox="0 0 24 24"
            width={width ?? size}
            height={height ?? size}
            stroke={color}
            fill="none"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            {...props}>
            <Path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
        </Svg>
    )
}
