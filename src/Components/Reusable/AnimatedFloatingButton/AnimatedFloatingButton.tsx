import React, { useEffect } from "react"
import { StyleProp, StyleSheet, useWindowDimensions, ViewStyle } from "react-native"
import LinearGradient from "react-native-linear-gradient"
import Animated, { ReduceMotion, useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated"
import { BaseButton, BaseView } from "~Components"
import { useKeyboard, useThemedStyles } from "~Hooks"

type Props = {
    title: string
    isVisible: boolean
    onPress: () => void
    extraBottom?: number
    isDisabled?: boolean
    isLoading?: boolean
    style?: StyleProp<ViewStyle>
}

export const AnimatedFloatingButton = React.memo(
    ({ title, isVisible, onPress, extraBottom = 0, isDisabled = false, isLoading = false, style }: Props) => {
        const { visible: keyboardVisible, bottomStyle } = useKeyboard()
        const { width: windowWidth } = useWindowDimensions()
        const { styles, theme } = useThemedStyles(baseStyles)
        const bottomInitialValue = -100

        const bottom = useSharedValue(bottomInitialValue)

        const animatedStyle = useAnimatedStyle(() => {
            return {
                bottom: bottom.value,
            }
        }, [bottom])

        useEffect(() => {
            let newValue = bottomInitialValue

            if (isVisible && keyboardVisible) {
                newValue = bottomStyle
            } else if (isVisible) {
                newValue = 0
            }

            bottom.value = withSpring(newValue, {
                mass: 1.2,
                damping: 22,
                stiffness: 190,
                overshootClamping: false,
                restDisplacementThreshold: 0.01,
                restSpeedThreshold: 2,
                reduceMotion: ReduceMotion.System,
            })
        }, [bottom, bottomInitialValue, bottomStyle, isVisible, keyboardVisible])

        return (
            <Animated.View style={[styles.rootContainer, animatedStyle]}>
                <LinearGradient colors={[theme.colors.backgroundTransparent, theme.colors.background]}>
                    <BaseView mx={20} style={{ width: windowWidth - 40 }} pb={24}>
                        <BaseButton
                            size="lg"
                            haptics="Medium"
                            w={100}
                            title={title}
                            action={onPress}
                            activeOpacity={0.94}
                            disabled={isDisabled}
                            isLoading={isLoading}
                            my={extraBottom}
                            style={style}
                        />
                    </BaseView>
                </LinearGradient>
            </Animated.View>
        )
    },
)

const baseStyles = () =>
    StyleSheet.create({
        rootContainer: {
            position: "absolute",
        },
    })
