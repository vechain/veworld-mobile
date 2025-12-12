import * as React from "react"
import Svg, { Path, SvgProps } from "react-native-svg"

export const NewLedgerLogo = (props: SvgProps) => {
    return (
        <Svg width={12} height={12} viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
            <Path
                d="M10.0532 0H4.56899V7.40074H11.9697V1.91655C11.9697 0.854648 11.1151 0 10.0532 0ZM2.85969 0H1.91655C0.854648 0 0 0.854648 0 1.91655V2.85969H2.85969V0ZM0 4.56899H2.85969V7.42868H0V4.56899ZM9.14031 11.9697H10.0834C11.1454 11.9697 12 11.1151 12 10.0532V9.14031H9.14031V11.9697ZM4.56899 9.14031H7.42868V12H4.56899V9.14031ZM0 9.14031V10.0834C0 11.1454 0.854648 12 1.91655 12H2.85969V9.14031H0Z"
                fill={props.color ?? "#fff"}
            />
        </Svg>
    )
}
