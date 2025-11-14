import { useCallback, useMemo } from "react"
import { ViewStyle } from "react-native"
import {
    cancelAnimation,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming,
} from "react-native-reanimated"

interface UseShakeAnimationReturn {
    animatedStyles: ViewStyle
    startShaking: () => void
    stopShaking: () => void
}

interface UseShakeAnimationProps {
    /**
     * Direction multiplier for the shake animation
     * 1 = start left to right, -1 = start right to left
     * @default 1
     */
    direction?: 1 | -1
}

export const useShakeAnimation = ({ direction = 1 }: UseShakeAnimationProps = {}): UseShakeAnimationReturn => {
    const rotation = useSharedValue(0)
    const translateY = useSharedValue(0)

    const animatedStyles = useAnimatedStyle(() => {
        return {
            transform: [{ rotate: `${rotation.value}deg` }, { translateY: translateY.value }],
        }
    }, [rotation, translateY])

    const startShaking = useCallback(() => {
        rotation.value = withRepeat(
            withSequence(withTiming(-2 * direction, { duration: 150 }), withTiming(2 * direction, { duration: 150 })),
            -1,
            false,
        )

        translateY.value = withRepeat(
            withSequence(withTiming(-1 * direction, { duration: 150 }), withTiming(1 * direction, { duration: 150 })),
            -1,
            true,
        )
    }, [direction, rotation, translateY])

    const stopShaking = useCallback(() => {
        cancelAnimation(rotation)
        cancelAnimation(translateY)
        rotation.value = withTiming(0, { duration: 200 })
        translateY.value = withTiming(0, { duration: 200 })
    }, [rotation, translateY])

    return useMemo(() => ({ animatedStyles, startShaking, stopShaking }), [animatedStyles, startShaking, stopShaking])
}
