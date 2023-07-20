import React, { useCallback, useEffect, useMemo } from "react"
import { Pressable, StyleProp, StyleSheet, View, ViewStyle } from "react-native"
import Animated, {
    useAnimatedRef,
    useAnimatedStyle,
    useDerivedValue,
    useSharedValue,
    withTiming,
} from "react-native-reanimated"
import { useTheme } from "~Hooks"
import { BaseIcon } from "~Components"
import * as Haptics from "expo-haptics"
import { mix } from "react-native-redash"

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
    extraData: number
    itmeHeight: number
}

export const BaseAccordion = ({
    headerComponent,
    headerStyle,
    headerOpenedStyle,
    headerClosedStyle,
    chevronContainerStyle,
    bodyComponent,
    defaultIsOpen,
    extraData,
    itmeHeight,
}: Props) => {
    const theme = useTheme()
    const aref = useAnimatedRef<View>()
    const open = useSharedValue(false)
    const height = useSharedValue(0)

    const progress = useDerivedValue(() =>
        open.value ? withTiming(1) : withTiming(0),
    )

    const progress1 = useDerivedValue(() => withTiming(extraData))

    const computedHeaderStyle = useAnimatedStyle(() => {
        if (open.value) return headerOpenedStyle ?? {}
        return headerClosedStyle ?? {}
    }, [open.value])

    const bodyContainerDynamicStyle = useAnimatedStyle(() => {
        return {
            // height: height.value * progress.value + 1,
            height: mix(progress.value, 0, itmeHeight * progress1.value),
            opacity: progress.value === 0 ? 0 : 1,
        }
    }, [height.value, progress.value, progress1.value])

    const dynamicStyle = useAnimatedStyle(() => {
        return {
            transform: [{ rotate: `${progress.value * 180}deg` }],
        }
    }, [])

    const onHeaderPress = useCallback(() => {
        if (height.value === 0) {
            height.value = mix(progress.value, 0, itmeHeight * extraData)
        }
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        open.value = !open.value
    }, [extraData, height, itmeHeight, open, progress.value])

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

    // WORK AROUND!!
    // first time it renders set default open state
    // I didn't find a better way to set the default open state
    useEffect(() => {
        if (defaultIsOpen) {
            setTimeout(onHeaderPress, 100)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <>
            <Pressable onPress={onHeaderPress}>
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
                <View ref={aref} style={styles.bodyContent} collapsable={false}>
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
