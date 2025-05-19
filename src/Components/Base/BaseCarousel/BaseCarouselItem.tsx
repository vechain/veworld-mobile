import { useNavigation } from "@react-navigation/native"
import React, { useCallback } from "react"
import { Animated, Linking, Pressable, StyleSheet, ViewStyle } from "react-native"
import { SCREEN_WIDTH } from "~Constants"
import { useThemedStyles } from "~Hooks"
import { Routes } from "~Navigation"

type Props = {
    testID?: string
    href?: string
    style?: ViewStyle
    contentWrapperStyle?: ViewStyle
    isExternalLink?: boolean
    onPress?: (name: string) => void
    /**
     * Decide when `onPress` is called. Default is `after
     */
    onPressActivation?: "before" | "after"
    name?: string
    children?: React.ReactNode
}

export const BaseCarouselItem: React.FC<Props> = ({
    href,
    style,
    testID,
    isExternalLink,
    onPress: propsOnPress,
    onPressActivation = "before",
    name,
    children,
    contentWrapperStyle,
}) => {
    const { styles } = useThemedStyles(baseStyles)
    const nav = useNavigation()

    const onPress = useCallback(async () => {
        if (!href) return
        if (isExternalLink) {
            if (onPressActivation === "before") propsOnPress?.(name ?? "")
            await Linking.openURL(href)
            if (onPressActivation === "after") propsOnPress?.(name ?? "")
        } else {
            if (onPressActivation === "before") propsOnPress?.(name ?? "")
            nav.navigate(Routes.BROWSER, { url: href })
            if (onPressActivation === "after") propsOnPress?.(name ?? "")
        }
    }, [href, isExternalLink, name, nav, onPressActivation, propsOnPress])

    return (
        <Animated.View style={[style, styles.container]}>
            <Pressable testID={testID} onPress={onPress}>
                <Animated.View style={[styles.contentWrapper, contentWrapperStyle]}>{children}</Animated.View>
            </Pressable>
        </Animated.View>
    )
}

const baseStyles = () =>
    StyleSheet.create({
        container: {
            flex: 1,
            width: SCREEN_WIDTH,
            pointerEvents: "box-none",
        },
        contentWrapper: {
            flex: 1,
            paddingHorizontal: 16,
        },
    })
