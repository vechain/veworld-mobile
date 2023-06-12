import React, { FC, memo } from "react"
import { StyleSheet, ViewProps } from "react-native"
import Animated, {
    AnimateProps,
    useAnimatedStyle,
    withTiming,
} from "react-native-reanimated"
import { useThemedStyles } from "~Hooks"
import { ColorThemeType } from "~Constants"

const LONG_WIDTH = 28
const WIDTH = 10

interface Props extends AnimateProps<ViewProps> {
    index: number
    length: number
    animValue: Animated.SharedValue<number>
}

export const PaginationItem: FC<Props> = memo(
    ({ animValue, index, length, ...animatedViewProps }) => {
        const { styles } = useThemedStyles(baseStyles)
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
        }, [length])

        return (
            <Animated.View
                {...animatedViewProps}
                style={[
                    styles.container,
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

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        container: {
            backgroundColor: theme.colors.primary,
            borderRadius: 50,
            overflow: "hidden",
            marginHorizontal: 2,
        },
    })
