import React, { useEffect, useState } from "react"
import { Image, StyleSheet, View } from "react-native"
import Animated, {
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from "react-native-reanimated"
import MaskedView from "@react-native-masked-view/masked-view"
import { COLORS, ColorThemeType } from "~Constants"
import { useThemedStyles } from "~Hooks"
import { PlatformUtils } from "~Utils"

type Props = {
    playAnimation: boolean
    animationDelay?: number
    children: React.ReactNode
}

/**
 * AnimatedSplashScreen component. It creates a loading animation screen for the application.
 * AnimatedSplashScreen uses a MaskedView to display an Animated.Image which scales during the loading process.
 *
 * @param {Props} props - The properties that define the AnimatedSplashScreen component.
 * @returns {React.ReactElement} Render the AnimatedSplashScreen component.
 *
 * @example
 * ```jsx
 * <AnimatedSplashScreen>
 *     <App />
 * </AnimatedSplashScreen>
 * ```
 */
export const AnimatedSplashScreen = ({
    playAnimation,
    animationDelay,
    children,
}: Props): React.ReactElement => {
    const loadingProgress = useSharedValue(0)
    const [animationDone, setAnimationDone] = useState(false)

    const { styles } = useThemedStyles(baseStyles)

    useEffect(() => {
        const startSplashScreenAnimation = () => {
            loadingProgress.value = withTiming(100, { duration: 800 }, () => {
                runOnJS(setAnimationDone)(true)
            })
        }

        if (playAnimation) {
            setTimeout(() => startSplashScreenAnimation(), animationDelay ?? 1)
        }
    }, [playAnimation, loadingProgress, animationDelay])

    const colorLayer = animationDone ? null : (
        <View style={[StyleSheet.absoluteFill, styles.colorLayer]} />
    )
    const whiteLayer = animationDone ? null : (
        <View style={[StyleSheet.absoluteFill, styles.whiteLayer]} />
    )

    const scaleOut = useAnimatedStyle(() => {
        return {
            transform: [
                {
                    scale: loadingProgress.value / 6, // Adjust according to your needs
                },
            ],
        }
    })

    const fadeOut = useAnimatedStyle(() => {
        return {
            opacity: 1 - loadingProgress.value / 100,
        }
    })

    return PlatformUtils.isAndroid() ? (
        <>
            {children}
            {!animationDone && (
                <Animated.View style={[styles.containerAndroid, fadeOut]}>
                    <View style={styles.centered}>
                        <Animated.View style={scaleOut}>
                            <Image
                                source={require("../bootsplash_logo_white.png")}
                                // eslint-disable-next-line react-native/no-inline-styles
                                style={{ width: 1000 }}
                                resizeMode="contain"
                            />
                        </Animated.View>
                    </View>
                </Animated.View>
            )}
        </>
    ) : (
        <View style={styles.containerIOS}>
            {colorLayer}
            <MaskedView
                style={styles.innerContainer}
                maskElement={
                    <View style={styles.centered}>
                        <Animated.View style={scaleOut}>
                            <Image
                                source={require("../bootsplash_logo_white.png")}
                                // eslint-disable-next-line react-native/no-inline-styles
                                style={{ width: 1000 }}
                                resizeMode="contain"
                            />
                        </Animated.View>
                    </View>
                }>
                {whiteLayer}
                {children}
            </MaskedView>
        </View>
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        containerIOS: {
            flex: 1,
        },
        containerAndroid: {
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: theme.colors.splashBackground,
        },
        innerContainer: {
            flex: 1,
        },
        centered: {
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
        },
        colorLayer: {
            backgroundColor: theme.colors.splashColorLayer,
        },
        whiteLayer: { backgroundColor: COLORS.WHITE },
    })
