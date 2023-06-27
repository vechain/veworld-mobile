import React, { useState, useEffect } from "react"
import { StyleSheet, View, Animated } from "react-native"
import MaskedView from "@react-native-masked-view/masked-view"
import { COLORS, ColorThemeType } from "~Constants"
import { useThemedStyles } from "~Hooks"
import { PlatformUtils } from "~Utils"

type Props = {
    children: React.ReactNode
}

/**
 * SplashScreen component. It creates a loading animation screen for the application.
 * SplashScreen uses a MaskedView to display an Animated.Image which scales during the loading process.
 *
 * @param {Props} props - The properties that define the SplashScreen component.
 * @returns {React.ReactElement} Render the SplashScreen component.
 *
 * @example
 * ```jsx
 * <SplashScreen>
 *     <App />
 * </SplashScreen>
 * ```
 */
export const SplashScreen = ({ children }: Props): React.ReactElement => {
    const [loadingProgress] = useState(new Animated.Value(0))
    const [animationDone, setAnimationDone] = useState(false)

    const { styles } = useThemedStyles(baseStyles)

    useEffect(() => {
        Animated.timing(loadingProgress, {
            toValue: 100,
            duration: 1000,
            useNativeDriver: true,
            delay: 0,
        }).start(() => {
            setAnimationDone(true)
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const colorLayer = animationDone ? null : (
        <View style={[StyleSheet.absoluteFill, styles.colorLayer]} />
    )
    const whiteLayer = animationDone ? null : (
        <View style={[StyleSheet.absoluteFill]} />
    )

    const imageScale = {
        transform: [
            {
                scale: loadingProgress.interpolate({
                    inputRange: [0, 15, 100],
                    outputRange: [0.1, 0.06, 16],
                }),
            },
        ],
    }

    if (PlatformUtils.isAndroid()) return <>{children}</>

    return (
        <View style={styles.container}>
            {colorLayer}
            <MaskedView
                style={styles.innerContainer}
                maskElement={
                    <View style={styles.centered}>
                        <Animated.Image
                            source={require("../bootsplash_logo_white.png")}
                            // eslint-disable-next-line react-native/no-inline-styles
                            style={[{ width: 1000 }, imageScale]}
                            resizeMode="contain"
                        />
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
