import { useNavigation } from "@react-navigation/native"
import React, { PropsWithChildren, useCallback, useEffect, useMemo } from "react"
import { StyleSheet, ViewProps } from "react-native"
import { Gesture, GestureDetector } from "react-native-gesture-handler"
import Animated, {
    Extrapolation,
    interpolate,
    runOnJS,
    useAnimatedReaction,
    useAnimatedStyle,
    useDerivedValue,
    useSharedValue,
    withDecay,
    withSpring,
    withTiming,
} from "react-native-reanimated"
import { useSafeAreaInsets } from "react-native-safe-area-context"
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

export const AssetDetailScreenWrapper = ({ children, handle = true }: Props) => {
    // const [scrollPosition, setScrollPosition] = useState(0)

    const { styles, theme } = useThemedStyles(baseStyles)

    const nav = useNavigation()

    const height = useSharedValue(SCREEN_HEIGHT)
    // const scrollHeight = useSharedValue(0)
    const translateY = useSharedValue(SCREEN_HEIGHT)
    // const touchStartY = useSharedValue(0)
    const scrollY = useSharedValue(0)

    // const isScrollableLocked = useDerivedValue(() => {
    //     return scrollY.value > 0
    // })

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

    const gesture = Gesture.Pan()
        // .onBegin(e => {
        //     console.log("onBegin")
        // })
        // .onStart(e => {
        //     console.log("onStart", e.translationY)
        //     touchStartY.value = e.translationY
        // })
        // .onChange(v => {
        //     "worklet"
        //     const lowestSnapPoint = DEFAULT_TRANSLATION

        //     const negativeScrollableContentOffset = !isScrollableLocked.value ? scrollHeight.value * -1 : 0

        //     const draggedPosition = touchStartY.value + v.translationY

        //     const accumulatedDraggedPosition = draggedPosition + negativeScrollableContentOffset

        //     const clampedPosition = clamp(accumulatedDraggedPosition, height.value, 0)
        // })
        .onUpdate(v => {
            translateY.value = Math.max(v.translationY, -DEFAULT_TRANSLATION) + DEFAULT_TRANSLATION
            // console.log("onUpdate", translateY.value)
        })
        .onEnd(() => {
            "worklet"
            // If more than 20%, then close the bottomsheet (navigate to previous page)
            if (translateY.value >= height.value / 5 && scrollY.value === 0) {
                onClose()
                return
            }

            translateY.value = withSpring(DEFAULT_TRANSLATION, { mass: 4, damping: 120, stiffness: 900 })
        })
        .enabled(scrollY.value === 0)
        .simultaneousWithExternalGesture(Gesture.Native().enabled(scrollY.value !== 0))

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

    useDerivedValue(() => {
        // console.log("scrollY.value", height.value)
        return scrollY.value
    }, [scrollY.value, height.value])

    return (
        <BaseSafeArea grow={1} style={styles.safeArea} bg="transparent">
            <Animated.View
                style={[StyleSheet.absoluteFillObject, backdropStyles]}
                onTouchStart={() => {
                    nav.goBack()
                }}
            />
            <GestureDetector gesture={gesture}>
                <Animated.View
                    style={[styles.root, animatedS]}
                    onLayout={e => {
                        if (PlatformUtils.isAndroid()) {
                            translateY.value = e.nativeEvent.layout.height
                        }
                        height.value = e.nativeEvent.layout.height
                    }}>
                    {handle && (
                        <BaseBottomSheetHandle
                            color={theme.isDark ? COLORS.DARK_PURPLE_DISABLED : COLORS.GREY_300}
                            style={styles.handle}
                        />
                    )}

                    <DraggableView>{children}</DraggableView>
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
        handle: {
            backgroundColor: theme.isDark ? COLORS.PURPLE : COLORS.APP_BACKGROUND_LIGHT,
            marginTop: 0,
            paddingTop: 16,
            paddingBottom: 16,
            zIndex: 1,
        },
    })

const DraggableView = ({
    children,
    enableContentPanning = true,

    style,
    ...props
}: PropsWithChildren<{ enableContentPanning?: boolean } & ViewProps>) => {
    const contentInitialOffset = useSharedValue(0)
    const contentHeight = useSharedValue(0)
    const initialposition = useSharedValue(0)
    const translateY = useSharedValue(0)
    const { bottom, top } = useSafeAreaInsets()

    const containerAbsoluteHeight = useMemo(() => {
        return SCREEN_HEIGHT - top - bottom
    }, [top, bottom])

    const clampedTranslateY = useDerivedValue(() => {
        const scrollableAreaHeight = contentHeight.value - containerAbsoluteHeight

        return Math.max(Math.min(translateY.value, 0), Math.min(0, -scrollableAreaHeight - contentInitialOffset.value))
    })

    const panningGesture = useMemo(() => {
        return Gesture.Pan()
            .enabled(enableContentPanning)
            .runOnJS(false)
            .shouldCancelWhenOutside(false)
            .onStart(() => {
                initialposition.value = clampedTranslateY.value
            })
            .onChange(e => {
                translateY.value = e.translationY + initialposition.value
            })
            .onEnd(e => {
                translateY.value = withDecay({ velocity: e.velocityY })
            })
    }, [enableContentPanning, initialposition, clampedTranslateY.value, translateY])

    const animatedStyles = useAnimatedStyle(() => {
        return {
            transform: [{ translateY: clampedTranslateY.value }],
        }
    }, [translateY.value])
    return (
        <GestureDetector gesture={panningGesture}>
            <Animated.View
                style={[animatedStyles, style]}
                {...props}
                onLayout={e => {
                    contentHeight.value = e.nativeEvent.layout.height
                    contentInitialOffset.value = e.nativeEvent.layout.y
                }}>
                {children}
            </Animated.View>
        </GestureDetector>
    )
}
