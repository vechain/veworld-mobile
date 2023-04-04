import React from "react"
import Lottie from "lottie-react-native"
import dotsJon from "../../../Assets/Lottie/dots-loader.json"

type Props = {
    color?: string
}
const dotsNumber = 4
export const DotsLoader: React.FC<Props> = ({ color }) => {
    const colorFilters = color
        ? Array.from(Array(dotsNumber).keys()).map((_, i) => ({
              keypath: `Dot${i + 1}`,
              color,
          }))
        : undefined

    return <Lottie source={dotsJon} colorFilters={colorFilters} autoPlay loop />
}
