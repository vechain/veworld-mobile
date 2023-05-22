import React from "react"
import Lottie from "lottie-react-native"
import vechainLogoJson from "../../../Assets/Lottie/vechain-logo-loader.json"
import { AnimatedLottieViewProps } from "lottie-react-native/lib/typescript/LottieView.types"

type Props = {} & Omit<AnimatedLottieViewProps, "source" | "colorFilters">

export const VechainLogoLoader: React.FC<Props> = ({ ...props }) => {
    return <Lottie source={vechainLogoJson} autoPlay loop {...props} />
}
