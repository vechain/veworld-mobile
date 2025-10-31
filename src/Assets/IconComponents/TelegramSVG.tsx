import * as React from "react"
import Svg, { Path } from "react-native-svg"

type TelegramSVGProps = {
    color?: string
    width?: number
    height?: number
}

export const TelegramSVG = ({ color = "#525860", width = 20, height = 20 }: TelegramSVGProps) => (
    <Svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} fill="none">
        <Path
            fill={color}
            fillRule="evenodd"
            d="M2.812 9.457c4.474-1.95 7.458-3.234 8.95-3.855 4.262-1.773 5.148-2.08 5.726-2.091.126-.003.41.028.594.178a.648.648 0 0 1 .218.416c.021.119.046.39.026.604-.23 2.426-1.23 8.315-1.738 11.033-.216 1.15-.64 1.536-1.049 1.574-.892.082-1.569-.589-2.432-1.155-1.35-.885-2.113-1.437-3.424-2.3-1.516-1-.534-1.548.33-2.445.226-.235 4.153-3.807 4.229-4.13.01-.041.018-.192-.072-.272-.09-.08-.222-.052-.317-.03-.136.03-2.294 1.457-6.474 4.278-.612.42-1.167.625-1.664.615-.548-.012-1.603-.31-2.386-.565-.961-.312-1.725-.477-1.658-1.008.034-.276.415-.56 1.141-.847Z"
            clipRule="evenodd"
        />
    </Svg>
)
