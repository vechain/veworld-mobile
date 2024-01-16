import React, { ReactElement } from "react"
import Svg, {
    Defs,
    LinearGradient,
    Stop,
    Path,
    SvgProps,
} from "react-native-svg"

export const VeChainVetLogoSVG = (props: SvgProps): ReactElement => {
    return (
        <Svg
            width={215}
            height={196}
            viewBox="0 0 321 292"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            {...props}>
            <Defs>
                <LinearGradient
                    id="a"
                    x1={0.38}
                    y1={145.62}
                    x2={320.07}
                    y2={145.62}
                    gradientUnits="userSpaceOnUse">
                    <Stop offset={0.13} stopColor="#270089" stopOpacity={1} />
                    <Stop offset={0.6} stopColor="#00bed6" stopOpacity={1} />
                    <Stop offset={1} stopColor="#80bc00" stopOpacity={1} />
                </LinearGradient>
            </Defs>
            <Path
                d="M320.07 0h-28.54a18.158 18.158 0 00-16.37 10.3l-75 156.15-.08-.16-20 41.59.08.17-20 41.58L60.38 41.67h28.44A18.14 18.14 0 01105.19 52l65.19 134.87 20-41.61-52.67-108.91A64.057 64.057 0 0079.95 0H.38l19.94 41.67h.06l119.83 249.56h40L320.07 0z"
                fill="url(#a)"
            />
        </Svg>
    )
}
