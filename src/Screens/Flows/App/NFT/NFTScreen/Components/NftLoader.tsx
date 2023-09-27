import React, { useEffect, useMemo } from "react"
import { StyleSheet, View } from "react-native"
import LottieView from "lottie-react-native"
import { AppLoader as NftLoaderAnimation } from "~Assets"
import { BlurView } from "~Components"
import { SCREEN_HEIGHT, SCREEN_WIDTH } from "~Constants"
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from "react-native-reanimated"
import { useTheme } from "~Hooks"

type Props = {
    children?: React.ReactNode
    isLoading?: boolean
}

export const NftLoader = ({ children, isLoading }: Props) => {
    const opacity = useSharedValue(isLoading ? 1 : 0)

    const { isDark } = useTheme()

    useEffect(() => {
        opacity.value = withTiming(isLoading ? 1 : 0)
    }, [isLoading, opacity])

    const animatedStyle = useAnimatedStyle(() => {
        return {
            opacity: opacity.value,
        }
    })

    const blurType = useMemo(() => {
        return isDark ? "dark" : "light"
    }, [isDark])

    return (
        <View style={StyleSheet.absoluteFill}>
            {children}
            <Animated.View
                style={[styles.overlay, animatedStyle]}
                pointerEvents={isLoading ? "auto" : "none"}>
                <BlurView
                    style={StyleSheet.absoluteFill}
                    blurAmount={2}
                    blurType={blurType}
                />
                <LottieView
                    source={NftLoaderAnimation} // TODO: Replace with the actual animation once it's ready (https://github.com/vechainfoundation/veworld-mobile/issues/999)
                    autoPlay={isLoading} // Prevent the animation from playing when it's not visible
                    loop
                    style={styles.lottie}
                />
            </Animated.View>
        </View>
    )
}

const styles = StyleSheet.create({
    overlay: {
        position: "absolute",
        top: 0,
        left: 0,
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT - 200,
        justifyContent: "center",
        alignItems: "center",
    },
    lottie: {
        width: "100%",
        height: 100,
    },
})
