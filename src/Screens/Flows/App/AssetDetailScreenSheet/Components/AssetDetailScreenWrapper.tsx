import { useNavigation } from "@react-navigation/native"
import React, { PropsWithChildren, useCallback, useEffect, useMemo } from "react"
import { StyleSheet } from "react-native"
import { Gesture, GestureDetector } from "react-native-gesture-handler"
import Animated, {
    Extrapolation,
    interpolate,
    runOnJS,
    useAnimatedReaction,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from "react-native-reanimated"
import { BaseSafeArea, BaseSpacer } from "~Components"
import { BaseBottomSheetHandle } from "~Components/Base/BaseBottomSheetHandle"
import { COLORS, ColorThemeType, SCREEN_HEIGHT } from "~Constants"
import { useThemedStyles } from "~Hooks"
import { PlatformUtils } from "~Utils"

type Props = PropsWithChildren<{
    handle?: boolean
}>

const PADDING_BOTTOM = 32
// This value should be exactly half of the PADDING_BOTTOM, so that when you pan on the handle, you don't see the backdrop behind
const DEFAULT_TRANSLATION = 16

export const AssetDetailScreenWrapper = ({ children, handle = true }: Props) => {
    const { styles, theme } = useThemedStyles(baseStyles)

    const nav = useNavigation()

    const height = useSharedValue(SCREEN_HEIGHT)
    const translateY = useSharedValue(SCREEN_HEIGHT)

    const animatedS = useAnimatedStyle(() => {
        return {
            transform: [{ translateY: translateY.value }],
        }
    }, [translateY.value])

    const backdropStyles = useAnimatedStyle(() => {
        return {
            backgroundColor: `rgba(0, 0, 0, ${interpolate(
                translateY.value,
                [0, height.value],
                [0.85, 0],
                Extrapolation.CLAMP,
            )})`,
        }
    }, [translateY.value, height.value])

    const onClose = useCallback(() => {
        "worklet"
        runOnJS(nav.goBack)()
    }, [nav.goBack])

    useAnimatedReaction(
        () => height.value,
        current => {
            if (current !== SCREEN_HEIGHT) {
                translateY.value = withTiming(DEFAULT_TRANSLATION, {
                    duration: 500,
                })
            }
        },
    )

    const gesture = useMemo(() => {
        return Gesture.Pan()
            .onUpdate(v => {
                translateY.value = Math.max(v.translationY, -DEFAULT_TRANSLATION) + DEFAULT_TRANSLATION
            })
            .onEnd(() => {
                "worklet"
                // If more than 20%, then close the bottomsheet (navigate to previous page)
                if (translateY.value >= height.value / 5) {
                    onClose()
                    return
                }
                translateY.value = withSpring(DEFAULT_TRANSLATION, { mass: 4, damping: 120, stiffness: 900 })
            })
    }, [height.value, onClose, translateY])

    useEffect(() => {
        const unsubscribe = nav.addListener("beforeRemove", e => {
            e.preventDefault()
            //It doesn't make sense, but otherwise we'll end up in a loop
            unsubscribe()
            translateY.value = withTiming(height.value, { duration: 200 }, finished => {
                if (finished) {
                    runOnJS(nav.dispatch)(e.data.action)
                }
            })
        })

        return () => {
            unsubscribe()
        }
    }, [height.value, nav, translateY])

    return (
        <BaseSafeArea grow={1} style={styles.safeArea} bg="transparent">
            <Animated.View
                style={[StyleSheet.absoluteFillObject, backdropStyles]}
                onTouchStart={() => {
                    nav.goBack()
                }}
            />
            <Animated.ScrollView
                style={[styles.root, animatedS]}
                onLayout={e => {
                    if (PlatformUtils.isAndroid()) {
                        translateY.value = e.nativeEvent.layout.height
                    }
                    height.value = e.nativeEvent.layout.height
                }}
                stickyHeaderIndices={[0]}>
                {handle && (
                    <>
                        <GestureDetector gesture={gesture}>
                            <BaseBottomSheetHandle
                                color={theme.isDark ? COLORS.DARK_PURPLE_DISABLED : COLORS.GREY_300}
                            />
                        </GestureDetector>
                        <BaseSpacer height={8} />
                    </>
                )}
                {children}
            </Animated.ScrollView>
        </BaseSafeArea>
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        root: {
            backgroundColor: theme.isDark ? COLORS.PURPLE : COLORS.APP_BACKGROUND_LIGHT,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            zIndex: 1,
            position: "relative",
            overflow: "hidden",
            paddingBottom: PADDING_BOTTOM,
            transformOrigin: "bottom",
        },
        safeArea: {
            justifyContent: "flex-end",
        },
    })
