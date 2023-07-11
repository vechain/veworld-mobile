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
    children,
}: Props): React.ReactElement => {
    const loadingProgress = useSharedValue(0)
    const [animationDone, setAnimationDone] = useState(false)

    const { styles } = useThemedStyles(baseStyles)

    useEffect(() => {
        if (playAnimation) {
            loadingProgress.value = withTiming(100, { duration: 700 }, () => {
                runOnJS(setAnimationDone)(true)
            })
        }
    }, [playAnimation, loadingProgress])

    const colorLayer = animationDone ? null : (
        <View style={[StyleSheet.absoluteFill, styles.colorLayer]} />
    )
    const whiteLayer = animationDone ? null : (
        <View style={[StyleSheet.absoluteFill, styles.whiteLayer]} />
    )

    const animatedStyles = useAnimatedStyle(() => {
        return {
            transform: [
                {
                    scale: loadingProgress.value / 6, // Adjust according to your needs
                },
            ],
        }
    })

    if (PlatformUtils.isAndroid()) return <>{children}</>

    return (
        <View style={styles.container}>
            {colorLayer}
            <MaskedView
                style={styles.innerContainer}
                maskElement={
                    <View style={styles.centered}>
                        <Animated.View style={animatedStyles}>
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
        container: {
            flex: 1,
        },
        innerContainer: {
            flex: 1,
        },
        centered: {
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
        },
        colorLayer: { backgroundColor: theme.colors.splashBackground },
        whiteLayer: { backgroundColor: COLORS.WHITE },
    })
