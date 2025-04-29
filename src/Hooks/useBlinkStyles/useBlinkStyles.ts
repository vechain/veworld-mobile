import { useAnimatedStyle, withRepeat, withSequence, withTiming } from "react-native-reanimated"

type Args = {
    enabled: boolean
    duration?: number
}

export const useBlinkStyles = ({ enabled, duration = 1000 }: Args) => {
    const animatedStyles = useAnimatedStyle(() => {
        if (!enabled) return { opacity: 1 }
        return {
            opacity: withRepeat(
                withSequence(
                    withTiming(1, { duration: Math.ceil(duration / 2) }),
                    withTiming(0, { duration: Math.ceil(duration / 2) }),
                ),
                -1,
            ),
        }
    }, [enabled])

    return animatedStyles
}
