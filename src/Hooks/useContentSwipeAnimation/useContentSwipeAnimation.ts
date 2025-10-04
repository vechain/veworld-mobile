import { useEffect } from "react"
import { Dimensions } from "react-native"
import { useSharedValue, useAnimatedStyle, withTiming, withDelay, Easing, runOnJS } from "react-native-reanimated"

const SCREEN_WIDTH = Dimensions.get("window").width

interface UseContentSwipeAnimationProps {
    animationDirection?: "left" | "right" | null
    onAnimationComplete?: () => void
    fadeOpacity?: number
}

export const useContentSwipeAnimation = ({
    animationDirection,
    onAnimationComplete,
    fadeOpacity = 0.4,
}: UseContentSwipeAnimationProps) => {
    const translateX = useSharedValue(0)
    const opacity = useSharedValue(1)

    useEffect(() => {
        if (!animationDirection) return

        const startTranslateX = animationDirection === "left" ? SCREEN_WIDTH : -SCREEN_WIDTH
        const exitTranslateX = animationDirection === "left" ? -SCREEN_WIDTH : SCREEN_WIDTH

        translateX.value = 0
        opacity.value = 1

        translateX.value = withTiming(exitTranslateX, {
            duration: 100,
            easing: Easing.out(Easing.quad),
        })
        opacity.value = withTiming(fadeOpacity, { duration: 90 })

        translateX.value = startTranslateX
        translateX.value = withDelay(
            60,
            withTiming(
                0,
                {
                    duration: 130,
                    easing: Easing.out(Easing.quad),
                },
                finished => {
                    if (finished && onAnimationComplete) {
                        runOnJS(onAnimationComplete)()
                    }
                },
            ),
        )
        opacity.value = withDelay(60, withTiming(1, { duration: 140 }))
    }, [animationDirection, translateX, opacity, onAnimationComplete, fadeOpacity])

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateX: translateX.value }],
            opacity: opacity.value,
        }
    })

    return {
        animatedStyle,
        translateX,
        opacity,
    }
}
