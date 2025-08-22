import React, { useEffect } from "react"
import { StyleSheet, View } from "react-native"
import LottieView from "lottie-react-native"
import { AppLoaderLight, AppLoaderDark } from "~Assets"

import { ColorThemeType, SCREEN_WIDTH } from "~Constants"
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated"
import { BaseView } from "~Components"
import { useThemedStyles, useTheme } from "~Hooks"

type Props = {
    children?: React.ReactNode
    isLoading?: boolean
}

export const NftLoader = ({ children, isLoading }: Props) => {
    const { styles: themedStyles } = useThemedStyles(baseStyles)
    const theme = useTheme()

    const opacity = useSharedValue(isLoading ? 1 : 0)

    useEffect(() => {
        opacity.value = withTiming(isLoading ? 1 : 0)
    }, [isLoading, opacity])

    const animatedStyle = useAnimatedStyle(() => {
        return {
            opacity: opacity.value,
        }
    }, [opacity])

    return (
        <View style={StyleSheet.absoluteFill}>
            {children}
            <Animated.View
                testID="nft-loader-overlay"
                style={[themedStyles.overlay, animatedStyle]}
                pointerEvents={isLoading ? "auto" : "none"}>
                <BaseView style={[themedStyles.overlay, themedStyles.opacityBackground]} />

                <LottieView
                    // TODO: Replace with the actual animation once it's ready (https://github.com/vechainfoundation/veworld-mobile/issues/999)
                    source={theme.isDark ? AppLoaderDark : AppLoaderLight}
                    autoPlay={isLoading} // Prevent the animation from playing when it's not visible
                    loop
                    style={themedStyles.lottie}
                />
            </Animated.View>
        </View>
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        overlay: {
            position: "absolute",
            top: 0,
            bottom: 0,
            width: SCREEN_WIDTH,
            justifyContent: "center",
            alignItems: "center",
        },
        opacityBackground: {
            backgroundColor: theme.colors.background,
            opacity: 0.4,
        },
        lottie: {
            width: "100%",
            height: 140,
        },
    })
