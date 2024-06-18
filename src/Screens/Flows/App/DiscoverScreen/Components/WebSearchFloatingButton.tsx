import React, { useEffect } from "react"
import { StyleSheet, useWindowDimensions } from "react-native"
import LinearGradient from "react-native-linear-gradient"
import Animated, { ReduceMotion, useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated"
import { BaseButton, BaseView } from "~Components"
import { useKeyboard, useThemedStyles } from "~Hooks"
import { useI18nContext } from "~i18n"

type WebSearchFloatingButtonProps = {
    isVisible: boolean
    onPress: () => void
}

export const WebSearchFloatingButton = React.memo(({ isVisible, onPress }: WebSearchFloatingButtonProps) => {
    const { LL } = useI18nContext()
    const { visible: keyboardVisible, bottomStyle } = useKeyboard()
    const { width: windowWidth } = useWindowDimensions()
    const { styles, theme } = useThemedStyles(baseStyles)
    const bottomInitialValue = -100

    const bottom = useSharedValue(bottomInitialValue)

    const animatedStyle = useAnimatedStyle(() => {
        return {
            bottom: bottom.value,
        }
    })

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
                        title={LL.DISCOVER_WEB_SEARCH_FLOATING_BUTTON_LABEL()}
                        action={onPress}
                        activeOpacity={0.94}
                    />
                </BaseView>
            </LinearGradient>
        </Animated.View>
    )
})

const baseStyles = () =>
    StyleSheet.create({
        rootContainer: {
            position: "absolute",
        },
    })
