import React, { useEffect } from "react"
import { Image, StyleSheet } from "react-native"
import { useApplicationSecurity } from "~Components/Providers"
import { SCREEN_HEIGHT } from "~Constants"
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from "react-native-reanimated"

type Props = {
    children: React.ReactNode
}

export const SplashScreen = ({ children }: Props): React.ReactElement => {
    const { isAppReady } = useApplicationSecurity()

    const opacity = useSharedValue(0)

    useEffect(() => {
        opacity.value = withTiming(1, { duration: 500 })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        if (isAppReady) {
            opacity.value = withTiming(0, { duration: 500 })
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAppReady])

    const animatedStyle = useAnimatedStyle(() => {
        return {
            opacity: opacity.value,
        }
    })

    return (
        <>
            {!isAppReady && (
                <Animated.View style={[styles.container, animatedStyle]}>
                    <Image
                        source={require("../bootsplash_logo_white.png")}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                </Animated.View>
            )}
            {children}
        </>
    )
}

const styles = StyleSheet.create({
    container: {
        height: "100%",
        backgroundColor: "#090230",
        alignItems: "center",
        justifyContent: "center",
    },
    logo: {
        position: "absolute",
        top: SCREEN_HEIGHT / 2 - 50,
        width: 100, // Set to a suitable width value
        height: 100, // Set to a suitable height value
    },
})
