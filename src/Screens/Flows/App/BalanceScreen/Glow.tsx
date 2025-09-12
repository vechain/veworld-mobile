import React from "react"
import { StyleProp, ViewStyle } from "react-native"
import Svg, { Defs, Ellipse, FeBlend, FeFlood, FeGaussianBlur, Filter, G } from "react-native-svg"

export const Glow = ({
    width = 375,
    height = 201,
    style,
}: {
    width?: number
    height?: number
    style?: StyleProp<ViewStyle>
}) => {
    return (
        <Svg
            width={width}
            height={height}
            viewBox="0 0 375 201"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={style}>
            <G filter="url(#filter0_f_12929_28112)">
                <Ellipse cx="187.5" cy="199" rx="235.5" ry="124" fill="#30265F" />
            </G>
            <Defs>
                <Filter id="filter0_f_12929_28112" x="-123" y="0" width="621" height="398" filterUnits="userSpaceOnUse">
                    <FeFlood floodOpacity="0" result="BackgroundImageFix" />
                    <FeBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
                    <FeGaussianBlur stdDeviation="37.5" result="effect1_foregroundBlur_12929_28112" />
                </Filter>
            </Defs>
        </Svg>
    )
}
