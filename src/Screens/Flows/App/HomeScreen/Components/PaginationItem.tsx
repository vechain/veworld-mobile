import React, { FC } from "react"
import { StyleSheet } from "react-native"
import Animated, {
    Extrapolate,
    interpolate,
    useAnimatedStyle,
    withTiming,
} from "react-native-reanimated"

const LONG_WIDTH = 28
const WIDTH = 10

type Props = {
    index: number
    length: number
    animValue: Animated.SharedValue<number>
}

export const PaginationItem: FC<Props> = ({ animValue, index, length }) => {
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
    })

    const animStyle = useAnimatedStyle(() => {
        let inputRange = [index - 1, index, index + 1]
        let outputRange = [-WIDTH, 0, WIDTH]

        if (index === 0 && animValue?.value > length - 1) {
            inputRange = [length - 1, length, length + 1]
            outputRange = [-WIDTH, 0, WIDTH]
        }

        return {
            transform: [
                {
                    translateX: interpolate(
                        animValue?.value,
                        inputRange,
                        outputRange,
                        Extrapolate.CLAMP,
                    ),
                },
            ],
        }
    }, [animValue, index, length])

    return (
        <Animated.View
            style={[
                baseStyles.container,
                {
                    width: WIDTH,
                    height: WIDTH,
                },
                animatedWidth,
            ]}>
            <Animated.View style={[baseStyles.dot, animStyle]} />
        </Animated.View>
    )
}

const baseStyles = StyleSheet.create({
    container: {
        backgroundColor: "#28008C",
        borderRadius: 50,
        overflow: "hidden",
        marginHorizontal: 2,
    },
    dot: {
        borderRadius: 50,
        flex: 1,
        backgroundColor: "#82be00",
    },
})
