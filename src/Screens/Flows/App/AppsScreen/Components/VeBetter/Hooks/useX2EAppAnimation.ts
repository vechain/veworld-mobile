import { useCallback, useEffect, useState } from "react"
import Animated, {
    AnimatedRef,
    interpolate,
    interpolateColor,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from "react-native-reanimated"
import { useTheme } from "~Hooks"
import { ANIMATION_TIMING, CONTENT_TIMING_CONFIG, PRESS_SPRING_CONFIG, SMOOTH_EASING } from "../constants"
import { VbdDApp } from "~Model"

interface UseX2EAppAnimationProps {
    isDefaultVisible?: boolean
    itemId?: string
    isOpen?: boolean
    onToggleOpen?: (itemId: string) => void
    scrollRef: AnimatedRef<Animated.FlatList<VbdDApp>>
    index: number
}

export const useX2EAppAnimation = ({
    isDefaultVisible = false,
    itemId,
    isOpen,
    onToggleOpen,
    scrollRef,
    index,
}: UseX2EAppAnimationProps) => {
    const useExternalState = itemId !== undefined && isOpen !== undefined && onToggleOpen !== undefined
    const theme = useTheme()
    const [internalShowDetails, setInternalShowDetails] = useState(isDefaultVisible)
    const [internalIsAnimating, setInternalIsAnimating] = useState(false)
    const [internalContentVisible, setInternalContentVisible] = useState(isDefaultVisible)

    const animationProgress = useSharedValue(isDefaultVisible ? 1 : 0)
    const scale = useSharedValue(1)

    const showDetails = useExternalState ? isOpen : internalShowDetails
    const isAnimating = useExternalState ? false : internalIsAnimating
    const contentVisible = useExternalState ? isOpen : internalContentVisible

    useEffect(() => {
        if (useExternalState) {
            animationProgress.value = withTiming(isOpen ? 1 : 0, {
                duration: ANIMATION_TIMING.totalDuration,
                easing: SMOOTH_EASING,
            })

            //Auto scroll to the selected index.
            if (isOpen)
                setTimeout(() => {
                    scrollRef.current?.scrollToIndex({ animated: true, index, viewPosition: 0 })
                }, 350)
        }
    }, [isOpen, useExternalState, animationProgress, scrollRef, index])

    const toggleDetails = useCallback(() => {
        if (useExternalState) {
            onToggleOpen(itemId)
        } else {
            if (internalIsAnimating) return
            setInternalIsAnimating(true)

            const isOpening = !internalShowDetails

            if (isOpening) {
                setInternalShowDetails(true)

                animationProgress.value = withTiming(1, {
                    duration: ANIMATION_TIMING.totalDuration,
                    easing: SMOOTH_EASING,
                })

                setTimeout(() => {
                    setInternalContentVisible(true)
                }, ANIMATION_TIMING.contentFadeDelay)

                setTimeout(() => {
                    setInternalIsAnimating(false)
                }, ANIMATION_TIMING.totalDuration)
            } else {
                setInternalContentVisible(false)

                animationProgress.value = withTiming(0, {
                    duration: ANIMATION_TIMING.totalDuration,
                    easing: SMOOTH_EASING,
                })

                setTimeout(() => {
                    setInternalShowDetails(false)
                    setInternalIsAnimating(false)
                }, ANIMATION_TIMING.totalDuration)
            }
        }
    }, [useExternalState, itemId, onToggleOpen, internalIsAnimating, internalShowDetails, animationProgress])

    const onPressIn = useCallback(() => {
        scale.value = withSpring(0.97, PRESS_SPRING_CONFIG)
    }, [scale])

    const onPressOut = useCallback(() => {
        scale.value = withSpring(1, PRESS_SPRING_CONFIG)
    }, [scale])

    const containerStyle = useAnimatedStyle(() => {
        const backgroundColor = interpolateColor(
            animationProgress.value,
            [0, 1],
            [theme.colors.transparent, theme.colors.x2eAppOpenDetails.background],
        )

        return {
            backgroundColor,
            borderRadius: interpolate(animationProgress.value, [0, 1], [10, 24]),
            borderWidth: interpolate(animationProgress.value, [0, 1], [0, 1]),
            borderColor: theme.colors.x2eAppOpenDetails.border,
        }
    }, [theme])

    const padding = useAnimatedStyle(() => {
        return {
            paddingTop: interpolate(animationProgress.value, [0, 1], [0, 24]),
            paddingHorizontal: interpolate(animationProgress.value, [0, 1], [0, 24]),
            paddingBottom: interpolate(animationProgress.value, [0, 1], [0, 12]),
        }
    }, [])

    const contentStyle = useAnimatedStyle(() => {
        return {
            opacity: contentVisible ? withTiming(1, CONTENT_TIMING_CONFIG) : withTiming(0, CONTENT_TIMING_CONFIG),
            transform: [
                {
                    scale: contentVisible
                        ? withTiming(1, CONTENT_TIMING_CONFIG)
                        : withTiming(0.97, CONTENT_TIMING_CONFIG),
                },
            ],
        }
    }, [contentVisible])

    const descriptionStyle = useAnimatedStyle(() => {
        return {
            opacity: interpolate(animationProgress.value, [0, 0.3], [1, 0]),
        }
    }, [])

    const categoryLabelStyle = useAnimatedStyle(() => {
        return {
            opacity: interpolate(animationProgress.value, [0.7, 1], [0, 1]),
            transform: [
                {
                    translateY: interpolate(animationProgress.value, [0.7, 1], [10, 0]),
                },
            ],
        }
    }, [])

    const pressAnimationStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: scale.value }],
        }
    }, [])

    const chevronStyle = useAnimatedStyle(() => {
        return {
            opacity: interpolate(animationProgress.value, [0.1, 0.7], [0, 1]),
            transform: [
                {
                    rotate: `${interpolate(animationProgress.value, [0, 1], [-180, 0])}deg`,
                },
            ],
        }
    }, [])

    const spacerStyle = useAnimatedStyle(() => {
        return {
            width: interpolate(animationProgress.value, [0, 1], [24, 16]),
        }
    }, [])

    return {
        state: {
            showDetails,
            isAnimating,
            contentVisible,
        },
        handlers: {
            toggleDetails,
            onPressIn,
            onPressOut,
        },
        styles: {
            containerStyle,
            padding,
            contentStyle,
            descriptionStyle,
            categoryLabelStyle,
            pressAnimationStyle,
            chevronStyle,
            spacerStyle,
        },
    }
}
