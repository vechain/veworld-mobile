import React, { useEffect, useMemo, useRef, useCallback } from "react"
import { StyleSheet, View } from "react-native"
import LottieView from "lottie-react-native"
import { AppLoaderLight, AppLoaderDark } from "~Assets"
import { BaseView, BlurView } from "~Components"
import { SCREEN_HEIGHT, SCREEN_WIDTH } from "~Constants"
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withTiming,
    cancelAnimation,
    runOnJS,
} from "react-native-reanimated"
import { useAppSelector, selectIsAppLoading } from "~Storage/Redux"
import { isAndroid } from "~Utils/PlatformUtils/PlatformUtils"
import { useTheme } from "~Hooks"

type Props = {
    children: React.ReactNode
}

/**
 * `AppLoader` is a component that displays a loading animation overlay.
 * The visibility of the loader is determined by the `isAppLoading` value from the Redux store.
 * When `isAppLoading` is `true`, the loader is visible and the animation plays.
 * Otherwise, the animation stops and the overlay is not visible.
 *
 * To properly use `AppLoader`, the `setIsAppLoading` action should be dispatched with `true`
 * before an async operation starts, and dispatched with `false` once the operation finishes.
 * This way, `AppLoader` will appear during the operation and disappear when the operation is done.
 *
 * @param {React.ReactNode} children - React children components to be rendered beneath the overlay.
 *
 * @example
 * ```jsx
 * import { setIsAppLoading } from "your/redux/actions"
 *
 * const YourComponent = () => {
 *     const dispatch = useDispatch()
 *     useEffect(() => {
 *         dispatch(setIsAppLoading(true))
 *         // Simulating an async operation
 *         setTimeout(() => {
 *             dispatch(setIsAppLoading(false))
 *         }, 3000)
 *     }, [dispatch])
 *
 *     return (
 *         <AppLoader>
 *             {children}
 *         </AppLoader>
 *     )
 * }
 * ```
 */
export const AppLoader = ({ children }: Props) => {
    const isAppLoading = useAppSelector(selectIsAppLoading)
    const theme = useTheme()
    const opacity = useSharedValue(isAppLoading ? 1 : 0)
    const timeoutRef = useRef<NodeJS.Timeout | null>(null)
    const lottieRef = useRef<LottieView>(null)
    const isVisibleRef = useRef(false)

    const resetLoader = useCallback(() => {
        cancelAnimation(opacity)
        opacity.value = 0
        isVisibleRef.current = false
        if (lottieRef.current) {
            lottieRef.current.pause()
        }
    }, [opacity])

    useEffect(() => {
        cancelAnimation(opacity)
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current)
            timeoutRef.current = null
        }

        if (isAppLoading) {
            isVisibleRef.current = true
            opacity.value = withTiming(1, { duration: 300 })
        } else {
            opacity.value = withTiming(0, { duration: 300 }, finished => {
                if (finished) {
                    runOnJS(resetLoader)()
                }
            })
        }

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
            }
            cancelAnimation(opacity)
        }
    }, [isAppLoading, opacity, resetLoader])

    const animatedStyle = useAnimatedStyle(() => {
        return {
            opacity: opacity.value,
            display: opacity.value === 0 ? "none" : "flex",
        }
    }, [opacity])

    const RenderBackdrop = useMemo(() => {
        if (isAndroid())
            return (
                <BaseView
                    style={[
                        styles.overlay,
                        styles.backdropOpacity,
                        {
                            backgroundColor: theme.colors.background,
                        },
                    ]}
                />
            )

        return <BlurView style={StyleSheet.absoluteFill} blurAmount={2} blurType={theme.isDark ? "dark" : "light"} />
    }, [theme.colors.background, theme.isDark])

    return (
        <View style={StyleSheet.absoluteFill}>
            {children}
            <Animated.View
                testID="app-loader-overlay"
                style={[styles.overlay, animatedStyle]}
                pointerEvents={isVisibleRef.current ? "auto" : "none"}>
                {RenderBackdrop}
                <LottieView
                    ref={lottieRef}
                    source={theme.isDark ? AppLoaderDark : AppLoaderLight}
                    autoPlay={isAppLoading}
                    loop
                    style={styles.lottie}
                />
            </Animated.View>
        </View>
    )
}

const styles = StyleSheet.create({
    backdropOpacity: { opacity: 0.7 },
    overlay: {
        position: "absolute",
        top: 0,
        left: 0,
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT * 1.1,
        justifyContent: "center",
        alignItems: "center",
    },
    lottie: {
        width: "100%",
        height: 140,
    },
})
