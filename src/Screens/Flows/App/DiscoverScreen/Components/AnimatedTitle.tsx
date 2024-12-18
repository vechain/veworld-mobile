import React from "react"
import { StyleSheet } from "react-native"
import Animated, { SharedValue, interpolate, useAnimatedStyle } from "react-native-reanimated"
import { BaseText, SelectedNetworkViewer } from "~Components"
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
                height: 40,
            }
        }

        if (scrollOffset.value > 200) {
            return {
                height: 0,
            }
        }

        return {
            opacity: interpolate(scrollOffset.value, [0, 100], [1, 0]),
            height: interpolate(scrollOffset.value, [0, 200], [40, 0]),
        }
    })

    return (
        <Animated.View style={[styles.rootContainer, animatedStylesHeader]}>
            <BaseText typographyFont="subTitleMedium" testID="settings-screen">
                {title}
            </BaseText>
            <SelectedNetworkViewer />
        </Animated.View>
    )
}

const baseStyles = () =>
    StyleSheet.create({
        rootContainer: {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginHorizontal: 24,
        },
    })
