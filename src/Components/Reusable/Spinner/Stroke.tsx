/* eslint-disable max-len */
import React from "react"
import Svg, { Path, SvgProps } from "react-native-svg"

export function Stroke(props: Readonly<SvgProps>) {
    return (
        <Svg width="17" height="16" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
            <Path
                d="M15.5 8C15.5 7.08075 15.3189 6.1705 14.9672 5.32122C14.6154 4.47194 14.0998 3.70026 13.4497 3.05025C12.7997 2.40024 12.0281 1.88463 11.1788 1.53284C10.3295 1.18106 9.41925 1 8.5 1"
                stroke="#261470"
                strokeWidth="2"
                strokeLinecap="square"
            />
        </Svg>
    )
}
