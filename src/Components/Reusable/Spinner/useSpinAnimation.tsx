import { useEffect } from "react"
import { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from "react-native-reanimated"

type Args = {
    duration?: number
}

export const useSpinAnimation = ({ duration = 2000 }: Args) => {
    const spinRotationValue = useSharedValue(0)

    useEffect(() => {
        spinRotationValue.value = withRepeat(withTiming(360, { duration, easing: Easing.linear }), -1, false)
    }, [duration, spinRotationValue])

    const infiniteSpinStyle = useAnimatedStyle(() => {
        return {
            transform: [{ rotate: `${spinRotationValue.value}deg` }],
        }
    }, [])

    return infiniteSpinStyle
}
