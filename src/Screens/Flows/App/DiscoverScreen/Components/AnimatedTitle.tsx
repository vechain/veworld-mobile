import React from "react"
import { StyleSheet } from "react-native"
import Animated, { SharedValue, interpolate, useAnimatedStyle } from "react-native-reanimated"
import { BaseText } from "~Components"
import { useThemedStyles } from "~Hooks"

type AnimatedTitleProps = {
    title: string
    scrollOffset: SharedValue<number>
}

export const AnimatedTitle = ({ title, scrollOffset }: AnimatedTitleProps) => {
    const { styles } = useThemedStyles(baseStyles)

    const animatedStylesHeader = useAnimatedStyle(() => {
        if (scrollOffset.value < 0) {
            return {
                height: 48,
            }
        }

        if (scrollOffset.value > 200) {
            return {
                height: 0,
            }
        }

        return {
            opacity: interpolate(scrollOffset.value, [0, 100], [1, 0]),
            height: interpolate(scrollOffset.value, [0, 200], [48, 0]),
        }
    })

    return (
        <Animated.View style={[styles.rootContainer, animatedStylesHeader]}>
            <BaseText typographyFont="subTitleSemiBold" testID="settings-screen">
                {title}
            </BaseText>
        </Animated.View>
    )
}

const baseStyles = () =>
    StyleSheet.create({
        rootContainer: {
            justifyContent: "center",
        },
    })
