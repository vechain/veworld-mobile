import React, { useCallback, useMemo } from "react"
import {
    LayoutRectangle,
    Pressable,
    StyleProp,
    StyleSheet,
    View,
    ViewStyle,
} from "react-native"
import Animated, {
    measure,
    runOnUI,
    useAnimatedRef,
    useAnimatedStyle,
    useDerivedValue,
    useSharedValue,
    withTiming,
} from "react-native-reanimated"
import { useTheme } from "~Common"
import { BaseIcon } from "~Components"
import * as Haptics from "expo-haptics"

type LayoutEvent = {
    layout: LayoutRectangle
    target?: number | null | undefined
}

type Props = {
    headerComponent: React.ReactNode
    headerStyle?: StyleProp<ViewStyle>
    headerOpenedStyle?: ViewStyle
    headerClosedStyle?: ViewStyle
    chevronContainerStyle?: StyleProp<
        Animated.AnimateStyle<StyleProp<ViewStyle>>
    >
    bodyComponent: React.ReactNode
}

export const BaseAccordion = ({
    headerComponent,
    headerStyle,
    headerOpenedStyle,
    headerClosedStyle,
    chevronContainerStyle,
    bodyComponent,
}: Props) => {
    const theme = useTheme()
    const aref = useAnimatedRef<View>()
    const open = useSharedValue(true)
    const isFirstOpen = useSharedValue(true)
    const height = useSharedValue(0)
    const progress = useDerivedValue(() =>
        open.value || isFirstOpen.value ? withTiming(1) : withTiming(0),
    )

    const computedHeaderStyle = useAnimatedStyle(() => {
        if (open.value) return headerOpenedStyle || {}
        return headerClosedStyle || {}
    }, [open.value])

    const bodyContainerDynamicStyle = useAnimatedStyle(() => {
        return {
            height: height.value * progress.value + 0.1,
            opacity: progress.value === 0 ? 0 : 1,
        }
    }, [height.value, progress.value, isFirstOpen.value])

    const dynamicStyle = useAnimatedStyle(() => {
        return {
            transform: [{ rotate: `${progress.value * 180}deg` }],
        }
    }, [])

    const onChevronPress = useCallback(() => {
        if (height.value === 0) {
            runOnUI(() => {
                "worklet"

                height.value = measure(aref)!.height
            })()
        }
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        open.value = !open.value
    }, [aref, height, open])

    const inFirstOpenLayout = useCallback(
        ({ nativeEvent }: { nativeEvent: LayoutEvent }) => {
            runOnUI(() => {
                "worklet"

                if (isFirstOpen.value) {
                    height.value = nativeEvent.layout.height
                    isFirstOpen.value = false
                }
            })()
        },
        [height, isFirstOpen],
    )

    const renderCollapseIcon = useMemo(() => {
        return (
            <Animated.View style={[dynamicStyle, chevronContainerStyle]}>
                <BaseIcon
                    name={"chevron-down"}
                    color={theme.colors.text}
                    size={36}
                    testID={"chevron"}
                />
            </Animated.View>
        )
    }, [dynamicStyle, chevronContainerStyle, theme])

    return (
        <>
            <Pressable onPress={onChevronPress}>
                <Animated.View
                    style={[
                        styles.headerContainer,
                        headerStyle,
                        computedHeaderStyle,
                    ]}>
                    {headerComponent}
                    {renderCollapseIcon}
                </Animated.View>
            </Pressable>
            <Animated.View
                style={[styles.bodyContainer, bodyContainerDynamicStyle]}>
                <View
                    ref={aref}
                    style={styles.bodyContent}
                    onLayout={inFirstOpenLayout}>
                    {bodyComponent}
                </View>
            </Animated.View>
        </>
    )
}

const styles = StyleSheet.create({
    headerContainer: {
        width: "100%",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    bodyContainer: {
        width: "100%",
        overflow: "hidden",
    },
    bodyContent: { width: "100%" },
})
