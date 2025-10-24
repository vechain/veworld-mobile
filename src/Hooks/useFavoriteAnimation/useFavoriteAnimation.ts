import { useCallback } from "react"
import { ViewStyle } from "react-native"
import {
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withSpring,
    withTiming,
} from "react-native-reanimated"

interface UseFavoriteAnimationReturn {
    animatedStyles: ViewStyle
    /**
     * Trigger the animation
     *
     * @param callback - Callback to be called when the animation is finished
     * @returns void
     */
    favoriteIconAnimation: (callback?: (finished: boolean) => void) => void
}

export const useFavoriteAnimation = (): UseFavoriteAnimationReturn => {
    const favoriteIconScaleValue = useSharedValue(1)
    const favoriteIconRotationValue = useSharedValue(0)

    const animatedStyles = useAnimatedStyle(() => {
        return {
            transform: [{ scale: favoriteIconScaleValue.value }, { rotate: `${favoriteIconRotationValue.value}deg` }],
        }
    }, [])

    const favoriteIconAnimation = useCallback(
        (callback?: (finished: boolean) => void) => {
            favoriteIconScaleValue.value = withSequence(
                withSpring(1.5, { duration: 100 }),
                withSpring(1, { duration: 200 }),
            )
            favoriteIconRotationValue.value = withSequence(
                withTiming(-10, { duration: 100 }),
                withRepeat(withTiming(30, { duration: 100 }), 1, true),
                withTiming(0, { duration: 50 }, finished => {
                    if (finished && callback) {
                        runOnJS(callback)(finished)
                    }
                }),
            )
        },
        [favoriteIconScaleValue, favoriteIconRotationValue],
    )

    return { animatedStyles, favoriteIconAnimation }
}
