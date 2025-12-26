import { Portal } from "@gorhom/portal"
import React, { forwardRef, PropsWithChildren, useCallback, useImperativeHandle, useMemo, useState } from "react"
import { StyleSheet } from "react-native"
import { NestableScrollContainer } from "react-native-draggable-flatlist"
import { Gesture, GestureDetector } from "react-native-gesture-handler"
import Animated, {
    clamp,
    Extrapolation,
    interpolate,
    LayoutAnimation,
    LayoutAnimationsValues,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from "react-native-reanimated"
import { BaseView } from "~Components"
import { BaseBottomSheetHandle } from "~Components/Base/BaseBottomSheetHandle"
import { COLORS, ColorThemeType, SCREEN_HEIGHT } from "~Constants"
import { useThemedStyles } from "~Hooks"
import { PlatformUtils } from "~Utils"

const PADDING_BOTTOM = 32
// This value should be exactly half of the PADDING_BOTTOM, so that when you pan on the handle, you don't see the backdrop behind
const DEFAULT_TRANSLATION = 16

const INITIAL_POS_Y_SCROLL = 0
const SCROLL_THRESHOLD = 4

type Props = PropsWithChildren<{
    handle?: boolean
    onDismiss?: () => void
}>

export type TestBottomSheetRef = {
    present: (data: unknown) => void
    close: () => void
}

export const TestBottomSheet = forwardRef<TestBottomSheetRef, Props>(function TestBottomSheet(
    { children, handle = true, onDismiss },
    ref,
) {
    const { styles, theme } = useThemedStyles(baseStyles)
    const height = useSharedValue(SCREEN_HEIGHT)
    const translateY = useSharedValue(SCREEN_HEIGHT)
    const scrollY = useSharedValue(0)
    const [_open, setOpen] = useState(false)
    const openSV = useSharedValue(false)

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

    const onScrollOffsetChange = useCallback(
        (scrollOffset: number) => {
            scrollY.value = scrollOffset
        },
        [scrollY],
    )

    const onClose = useCallback(() => {
        translateY.value = withSpring(height.get(), { mass: 4, damping: 120, stiffness: 900 }, () => {
            openSV.value = false
        })
        setOpen(false)
        onDismiss?.()
    }, [height, onDismiss, openSV, translateY])

    const onOpen = useCallback(() => {
        translateY.value = withSpring(DEFAULT_TRANSLATION, { mass: 4, damping: 120, stiffness: 900 })
        setOpen(true)
        openSV.value = true
    }, [openSV, translateY])

    useImperativeHandle(ref, () => ({ present: onOpen, close: onClose }))

    const nativeGesture = Gesture.Native()

    const handleGesture = useMemo(() => {
        return Gesture.Pan()
            .onUpdate(v => {
                translateY.value = Math.max(v.translationY, -DEFAULT_TRANSLATION) + DEFAULT_TRANSLATION
            })
            .onEnd(() => {
                "worklet"
                // If more than 40%, then close the bottomsheet
                if (translateY.value >= (height.get() * 2) / 5) {
                    runOnJS(onClose)()
                    return
                }
                translateY.value = withSpring(DEFAULT_TRANSLATION, { mass: 4, damping: 120, stiffness: 900 })
            })
    }, [height, onClose, translateY])

    // This is needed on iOS only because the scroll view works in a different way than on Android
    // Also on Android this gesture block the scroll completely
    const scrollPanGesture = Gesture.Pan()
        .onUpdate(({ translationY }) => {
            const clampedValue = clamp(translationY, 0, 0)
            scrollY.value = clampedValue
        })
        .onFinalize(({ translationY }) => {
            const scrollGoBackAnimation = withTiming(INITIAL_POS_Y_SCROLL)
            if (translationY >= SCROLL_THRESHOLD && scrollY.value <= 0) {
                runOnJS(onClose)()
                scrollY.value = scrollGoBackAnimation
            }
        })
        .enabled(PlatformUtils.isIOS())

    const composedGestures = Gesture.Simultaneous(scrollPanGesture, nativeGesture)

    const rootAnimatedStyles = useAnimatedStyle(() => {
        return {
            top: openSV.value ? 0 : SCREEN_HEIGHT,
            left: 0,
            zIndex: openSV.value ? 1000 : -1,
        }
    }, [openSV])

    const LayoutTransition = useCallback(
        (values: LayoutAnimationsValues): LayoutAnimation => {
            "worklet"
            if (translateY.get() === DEFAULT_TRANSLATION)
                return {
                    initialValues: {
                        originX: values.currentOriginX,
                        originY: values.currentOriginY,
                        width: values.currentWidth,
                        height: values.currentHeight,
                    },
                    animations: {
                        originX: withTiming(values.targetOriginX),
                        originY: withTiming(values.targetOriginY),
                        width: withTiming(values.targetWidth),
                        height: withTiming(values.targetHeight),
                    },
                }
            return {
                animations: {},
                initialValues: {
                    originX: values.currentOriginX,
                    originY: values.currentOriginY,
                    width: values.currentWidth,
                    height: values.currentHeight,
                },
            }
        },
        [translateY],
    )

    return (
        <Portal>
            <Animated.View style={[StyleSheet.absoluteFillObject, rootAnimatedStyles]}>
                <BaseView flexGrow={1} style={styles.safeArea} bg="transparent" position="relative">
                    <Animated.View
                        style={[StyleSheet.absoluteFillObject, backdropStyles]}
                        onTouchStart={() => {
                            onClose()
                        }}
                    />
                    <GestureDetector gesture={composedGestures}>
                        <Animated.View
                            style={[styles.root, animatedS]}
                            onLayout={e => {
                                height.value = e.nativeEvent.layout.height
                            }}
                            layout={LayoutTransition}>
                            <GestureDetector gesture={handleGesture}>
                                {handle && (
                                    <BaseBottomSheetHandle
                                        color={theme.isDark ? COLORS.DARK_PURPLE_DISABLED : COLORS.GREY_300}
                                        style={styles.handle}
                                    />
                                )}
                            </GestureDetector>

                            <NestableScrollContainer
                                bounces={false}
                                showsVerticalScrollIndicator={false}
                                nestedScrollEnabled
                                onScrollOffsetChange={onScrollOffsetChange}>
                                {children}
                            </NestableScrollContainer>
                        </Animated.View>
                    </GestureDetector>
                </BaseView>
            </Animated.View>
        </Portal>
    )
})

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        root: {
            backgroundColor: theme.isDark ? COLORS.DARK_PURPLE : COLORS.GREY_50,
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
        handle: {
            backgroundColor: theme.isDark ? COLORS.DARK_PURPLE : COLORS.GREY_50,
            marginTop: 0,
            paddingTop: 16,
            paddingBottom: 16,
            zIndex: 1,
        },
    })
