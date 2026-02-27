import { useNavigation } from "@react-navigation/native"
import React, { PropsWithChildren, useCallback, useEffect, useMemo, useRef, useState } from "react"
import { NativeScrollEvent, NativeSyntheticEvent, StyleSheet } from "react-native"
import { Gesture, GestureDetector, ScrollView as GestureScrollView, GestureType } from "react-native-gesture-handler"
import Animated, {
    clamp,
    Extrapolation,
    interpolate,
    runOnJS,
    useAnimatedReaction,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from "react-native-reanimated"
import { BaseSafeArea } from "~Components"
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

const INITIAL_POS_Y_SCROLL = 0
const SCROLL_THRESHOLD = 100

export const AssetDetailScreenWrapper = ({ children, handle = true }: Props) => {
    const nativeGestureRef = useRef<GestureType>(undefined)
    const scrollPanGestureRef = useRef<GestureType>(undefined)
    const [scrollEnabled, setScrollEnabled] = useState(true)

    const { styles, theme } = useThemedStyles(baseStyles)
    const nav = useNavigation()

    const height = useSharedValue(SCREEN_HEIGHT)
    const translateY = useSharedValue(SCREEN_HEIGHT)
    const scrollY = useSharedValue(0)

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

    const onScrollOffsetChange = useCallback(
        (e: NativeSyntheticEvent<NativeScrollEvent>) => {
            scrollY.value = e.nativeEvent.contentOffset.y
        },
        [scrollY],
    )

    useAnimatedReaction(
        () => height.value,
        current => {
            if (current !== SCREEN_HEIGHT) {
                translateY.value = withTiming(DEFAULT_TRANSLATION, {
                    duration: 500,
                })
                scrollY.value = 0
            }
        },
    )

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

    const handleGesture = useMemo(() => {
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

    const nativeGesture = Gesture.Native().withRef(nativeGestureRef)

    const scrollPanGesture = Gesture.Pan()
        .withRef(scrollPanGestureRef)
        .hitSlop({ top: 200 })
        .onUpdate(({ translationY }) => {
            const clampedValue = clamp(translationY, 0, 0)
            scrollY.value = clampedValue
        })
        .onFinalize(({ translationY }) => {
            const scrollGoBackAnimation = withTiming(INITIAL_POS_Y_SCROLL)
            if (translationY > SCROLL_THRESHOLD && scrollY.value <= 0) {
                onClose()
                scrollY.value = scrollGoBackAnimation
            }
        })
        .activeOffsetY(200)

    const composedGestures = Gesture.Simultaneous(scrollPanGesture, nativeGesture)

    const onContentSizeChange = useCallback(
        (_: number, h: number) => {
            // If the content is taller than the screen, then disable the scroll
            setScrollEnabled(h > height.value)
        },
        [height.value],
    )

    return (
        <BaseSafeArea grow={1} style={styles.safeArea} bg="transparent">
            <Animated.View
                style={[StyleSheet.absoluteFillObject, backdropStyles]}
                onTouchStart={() => {
                    nav.goBack()
                }}
            />
            <GestureDetector gesture={composedGestures}>
                <Animated.View
                    style={[styles.root, animatedS]}
                    onLayout={e => {
                        if (PlatformUtils.isAndroid()) {
                            translateY.value = e.nativeEvent.layout.height
                        }
                        height.value = e.nativeEvent.layout.height
                    }}>
                    <GestureDetector gesture={handleGesture}>
                        {handle && (
                            <BaseBottomSheetHandle
                                color={theme.isDark ? COLORS.DARK_PURPLE_DISABLED : COLORS.GREY_300}
                                style={styles.handle}
                            />
                        )}
                    </GestureDetector>

                    <GestureScrollView
                        scrollEnabled={scrollEnabled}
                        nestedScrollEnabled
                        scrollEventThrottle={16}
                        // Allows the scroll to close the bottom sheet gesture to be used simultaneously with the native gesture
                        simultaneousHandlers={[scrollPanGestureRef, nativeGestureRef]}
                        showsVerticalScrollIndicator={false}
                        onContentSizeChange={onContentSizeChange}
                        onScroll={onScrollOffsetChange}>
                        {children}
                    </GestureScrollView>
                </Animated.View>
            </GestureDetector>
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
            maxHeight: "100%",
        },
        safeArea: {
            justifyContent: "flex-end",
        },
        handleContainer: {
            alignContent: "flex-start",
            flexShrink: 0,
            flexGrow: 0,
            backgroundColor: "red",
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 1,
        },
        handle: {
            backgroundColor: theme.isDark ? COLORS.PURPLE : COLORS.APP_BACKGROUND_LIGHT,
            marginTop: 0,
            paddingTop: 16,
            paddingBottom: 16,
            zIndex: 1,
        },
    })
