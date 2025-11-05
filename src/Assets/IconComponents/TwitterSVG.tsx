import * as React from "react"
import Svg, { Path } from "react-native-svg"

type TwitterSVGProps = {
    color?: string
    width?: number
    height?: number
}

export const TwitterSVG = ({ color = "#525860", width = 20, height = 20 }: TwitterSVGProps) => (
    <Svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} fill="none">
        <Path
            fill={color}
            d="M11.427 8.851 17.011 2.5h-1.323l-4.849 5.515L6.967 2.5H2.5l5.856 8.34L2.5 17.5h1.323l5.12-5.824 4.09 5.824H17.5l-6.073-8.649Zm-1.812 2.062-.594-.83-4.72-6.608h2.032l3.81 5.332.593.83 4.952 6.933h-2.032l-4.041-5.657Z"
        />
    </Svg>
)
