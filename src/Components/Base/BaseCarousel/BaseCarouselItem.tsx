import { useNavigation, useRoute } from "@react-navigation/native"
import React, { useCallback, useMemo } from "react"
import { Animated, Linking, StyleSheet, TouchableOpacity, ViewStyle } from "react-native"
import { SCREEN_WIDTH } from "~Constants"
import { useThemedStyles } from "~Hooks"
import { useBrowserTab } from "~Hooks/useBrowserTab"
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

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity)

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
    const route = useRoute()
    const { navigateWithTab } = useBrowserTab()

    const returnScreen = useMemo(() => {
        if (route.name === Routes.TOKEN_DETAILS) {
            return Routes.HOME
        }
        return route.name as Routes.DISCOVER | Routes.SETTINGS | Routes.HOME
    }, [route.name])

    const onPress = useCallback(async () => {
        if (!href) return
        if (isExternalLink) {
            if (onPressActivation === "before") propsOnPress?.(name ?? "")
            await Linking.openURL(href)
            if (onPressActivation === "after") propsOnPress?.(name ?? "")
        } else {
            if (onPressActivation === "before") propsOnPress?.(name ?? "")
            navigateWithTab({
                title: name || href,
                url: href,
                navigationFn(u) {
                    nav.navigate(Routes.BROWSER, { url: u, returnScreen })
                },
            })
            if (onPressActivation === "after") propsOnPress?.(name ?? "")
        }
    }, [href, isExternalLink, onPressActivation, propsOnPress, name, navigateWithTab, nav, returnScreen])

    return (
        <AnimatedTouchableOpacity testID={testID} style={[style, styles.container]} onPress={onPress}>
            <Animated.View style={[styles.contentWrapper, contentWrapperStyle]}>{children}</Animated.View>
        </AnimatedTouchableOpacity>
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
