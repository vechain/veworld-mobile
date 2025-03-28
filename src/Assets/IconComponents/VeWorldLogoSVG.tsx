import * as React from "react"
import Svg, { Defs, LinearGradient, Stop, Path } from "react-native-svg"
/* SVGR has dropped some elements not supported by react-native-svg: animate */

interface Props {
    height: string | number
    width: string | number
}

export const VeWorldLogoSVG = ({ height, width }: Props) => {
    return (
        <Svg
            width={width || 1319}
            height={height || 826}
            viewBox="0 0 1319 826"
            fill="none"
            xmlns="http://www.w3.org/2000/svg">
            <Defs>
                <LinearGradient id="a" x1="0%" y1="0%" x2="100%" y2="100%">
                    <Stop offset="0%" stopColor="#28008C" />
                    <Stop offset="50%" stopColor="#00BED7" />
                    <Stop offset="100%" stopColor="#82BE00" />
                </LinearGradient>
            </Defs>
            <Path
                fill="url(#a)"
                fillRule="evenodd"
                clipRule="evenodd"
                d="M1068.22 1.223c-34.94 3.294-71.993 18.378-100.117 40.752-13.577 10.802-30.056 29.392-40.84 46.076-1.678 2.594-38.759 76.57-82.403 164.392l-79.352 159.674 28.819 58.356c15.851 32.096 28.92 58.47 29.044 58.609.124.14 43.522-86.955 96.44-193.544 78.474-158.061 97.109-194.818 101.049-199.328 6.01-6.862 15.19-12.889 24.22-15.889 6.57-2.186 8.96-2.308 52.75-2.682 27.81-.239 45.86-.011 45.86.581 0 .87-108.94 222.367-236.227 480.29-25.458 51.586-47.937 97.221-49.955 101.413-2.018 4.192-3.905 7.591-4.193 7.556-.64-.079-30.167-59.679-51.895-104.751-8.756-18.16-33.216-67.806-54.356-110.325l-38.437-77.307-58.431.025-58.432.024-13.248 27.491c-46.834 97.19-72.193 149.96-97.335 202.546-15.71 32.861-28.862 60.067-29.227 60.457-.364.389-63.944-131.216-141.29-292.454L170.035 120.022l42.613-.321c29.495-.222 44.387.053 48.378.896 11.831 2.497 24.258 10.916 31.212 21.147 1.676 2.466 44.707 90.693 95.625 196.061 50.917 105.368 92.669 191.453 92.783 191.3.114-.152 12.818-26.528 28.232-58.613l28.026-58.336-20.937-43.342C411.517 152.59 383.899 95.885 379.733 89.099c-18.993-30.946-44.714-54.214-77.104-69.757-21.706-10.415-41.447-15.496-66.972-17.24C222.387 1.198 0 .526 0 1.393c0 .45 26.663 56.03 200.722 418.421a2843593.204 2843593.204 0 01169.9 353.776l24.398 50.839 56.51.271 56.511.271 70.313-146.498c38.673-80.575 70.682-146.42 71.131-146.324.447.096 33.384 66.252 73.19 147.014L795.05 826h116.638l8.71-18.082c10.396-21.582 74.236-151.241 225.152-457.287 61.41-124.529 124.87-253.303 141.02-286.165 16.16-32.862 30.07-60.81 30.9-62.107L1319 0l-120.41.143c-66.23.078-124.9.565-130.37 1.08z"
            />
        </Svg>
    )
}
