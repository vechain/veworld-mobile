import { useAnimatedStyle, withTiming } from "react-native-reanimated"

export const useTokenAnimations = (isEdit: boolean) => {
    const animatedOpacity = useAnimatedStyle(() => {
        return {
            opacity: withTiming(isEdit ? 1 : 0, {
                duration: 200,
            }),
        }
    }, [isEdit])

    return {
        animatedOpacity,
    }
}
