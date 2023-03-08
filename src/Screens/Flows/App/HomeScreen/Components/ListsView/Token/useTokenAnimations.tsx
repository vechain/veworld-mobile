import { useAnimatedStyle, withTiming } from "react-native-reanimated"

export const useTokenAnimations = (isEdit: boolean) => {
    const animatedWidthRow = useAnimatedStyle(() => {
        return {
            width: withTiming(isEdit ? "88%" : "100%", {
                duration: 200,
            }),
        }
    }, [isEdit])

    const animatedPositionInnerRow = useAnimatedStyle(() => {
        return {
            transform: [
                {
                    translateX: withTiming(isEdit ? 40 : 0, {
                        duration: 200,
                    }),
                },
            ],
        }
    }, [isEdit])

    const animatedOpacity = useAnimatedStyle(() => {
        return {
            opacity: withTiming(isEdit ? 1 : 0, {
                duration: 200,
            }),
        }
    }, [isEdit])

    const animatedDeleteIcon = useAnimatedStyle(() => {
        return {
            transform: [
                {
                    translateX: withTiming(isEdit ? -10 : 0, {
                        duration: 200,
                    }),
                },
            ],
        }
    }, [isEdit])

    return {
        animatedWidthRow,
        animatedPositionInnerRow,
        animatedOpacity,
        animatedDeleteIcon,
    }
}
