import * as React from "react"
import Svg, { Path } from "react-native-svg"
import { SvgProps } from "react-native-svg/lib/typescript/ReactNativeSVG"

export function TransakLogoSmallSvg(props: Readonly<SvgProps>) {
    return (
        <Svg
            width={props.width ? props.width : "100px"}
            height={props.width ? props.width : "100px"}
            viewBox="0 0 400 400"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            {...props}>
            <Path
                d="M200.1,399.9C91.2,400.9-.7,311.6,0,199.2.7,89.1,88.3.4,199.4.1S399.8,89.3,400,200,309,400.7,200.1,399.9Z"
                fill="#0075f1"
            />
            <Path
                d="M127.5,211.1l-5.3-4.9c-7.3-7.3-14.5-14.7-21.9-22-5.6-5.6-13.8-5.8-19-.8s-6,13.2-.1,19.2q25,25.5,50.4,50.7c5.8,5.7,12.7,5.8,19.1.7a45.7,45.7,0,0,0,4.5-4.3l67.9-68.3c2.2-2.3,4.7-4.4,8-7.6v6.9q0,31.1.1,62.1c0,8.9,5.6,14.8,13.3,14.7s12.9-6.4,13.2-14.6c.1-1.7.1-3.4.1-5.1,0-19-.1-38,0-57,0-2,.2-3.9.3-7.2l5,4.7c7.8,7.8,15.5,15.8,23.5,23.4s19.1,4,22.1-6.2c1.8-6.2-1.4-10.7-5.4-14.7l-46.5-46.5c-8.3-8.4-15.7-8.6-24-.2L164.1,203l-8.7,8.5-1.3-.6v-6c.1-21.2.1-42.5,0-63.7,0-9.5-5.7-15.3-14-14.9s-12.4,6.2-12.5,15c-.2,14-.1,28-.1,42Z"
                fill="#fff"
                transform="translate(8, 10)"
            />
        </Svg>
    )
}
