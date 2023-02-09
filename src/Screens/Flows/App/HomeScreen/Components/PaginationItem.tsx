import React, { FC, memo } from "react"
import { StyleSheet, ViewProps } from "react-native"
import Animated, {
    AnimateProps,
    useAnimatedStyle,
    withTiming,
} from "react-native-reanimated"

const LONG_WIDTH = 28
const WIDTH = 10

interface Props extends AnimateProps<ViewProps> {
    index: number
    length: number
    animValue: Animated.SharedValue<number>
}

export const PaginationItem: FC<Props> = memo(
    ({ animValue, index, length, ...animatedViewProps }) => {
        const animatedWidth = useAnimatedStyle(() => {
            let dotWidth = withTiming(
                Math.round(animValue.value) === index ? LONG_WIDTH : WIDTH,
            )
            if (index === 0 && animValue.value > length - 1) {
                dotWidth = LONG_WIDTH
            }
            return {
                width: dotWidth,
            }
        }, [])

        return (
            <Animated.View
                {...animatedViewProps}
                style={[
                    baseStyles.container,
                    {
                        width: WIDTH,
                        height: WIDTH,
                    },
                    animatedWidth,
                ]}
            />
        )
    },
)

const baseStyles = StyleSheet.create({
    container: {
        backgroundColor: "#28008C",
        borderRadius: 50,
        overflow: "hidden",
        marginHorizontal: 2,
    },
})
