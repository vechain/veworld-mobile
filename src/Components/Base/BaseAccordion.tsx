import React, { useCallback, useEffect, useMemo } from "react"
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native"
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

type Props = {
    headerComponent: React.ReactNode
    headerStyle?: StyleProp<ViewStyle>
    headerOpenedStyle?: ViewStyle
    headerClosedStyle?: ViewStyle
    chevronContainerStyle?: StyleProp<
        Animated.AnimateStyle<StyleProp<ViewStyle>>
    >
    bodyComponent: React.ReactNode
    defaultIsOpen?: boolean
}

export const BaseAccordion = ({
    headerComponent,
    headerStyle,
    headerOpenedStyle,
    headerClosedStyle,
    chevronContainerStyle,
    bodyComponent,
    defaultIsOpen,
}: Props) => {
    const theme = useTheme()
    const aref = useAnimatedRef<View>()
    const open = useSharedValue(false)
    const height = useSharedValue(0)
    const progress = useDerivedValue(() =>
        open.value ? withTiming(1) : withTiming(0),
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
    }, [height.value, progress.value])

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
        open.value = !open.value
    }, [aref, height, open])

    const renderCollapseIcon = useMemo(() => {
        return (
            <Animated.View style={[dynamicStyle, chevronContainerStyle]}>
                <BaseIcon
                    name={"chevron-down"}
                    color={theme.colors.text}
                    size={36}
                    action={onChevronPress}
                    testID={"chevron"}
                />
            </Animated.View>
        )
    }, [dynamicStyle, chevronContainerStyle, onChevronPress, theme])

    // WORK AROUND!!
    // first time it renders set default open state
    // I didn't find a better way to set the default open state
    useEffect(() => {
        if (defaultIsOpen) {
            setTimeout(onChevronPress, 100)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <>
            <Animated.View
                style={[
                    styles.headerContainer,
                    headerStyle,
                    computedHeaderStyle,
                ]}>
                {headerComponent}
                {renderCollapseIcon}
            </Animated.View>
            <Animated.View
                style={[styles.bodyContainer, bodyContainerDynamicStyle]}>
                <View ref={aref} style={styles.bodyContent}>
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
    bodyContainer: { width: "100%", overflow: "hidden" },
    bodyContent: { width: "100%" },
})
