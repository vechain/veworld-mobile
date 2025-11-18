import { NavigationState, useNavigation, useNavigationState } from "@react-navigation/native"
import React, { useCallback, useMemo } from "react"
import { Animated, Linking, Pressable, StyleProp, StyleSheet, TouchableOpacity, ViewStyle } from "react-native"
import { COLORS, SCREEN_WIDTH } from "~Constants"
import { useThemedStyles } from "~Hooks"
import { useBrowserTab } from "~Hooks/useBrowserTab"
import { Routes } from "~Navigation"
import { BaseIcon } from "../BaseIcon"

export type CarouselPressEvent = {
    name: string
    defaultPrevented: boolean
    /**
     * Prevent the default action of the event.
     * Works only if `onPressActivation` is set to `before`.
     */
    preventDefault: () => void
}

type Props = {
    testID?: string
    href?: string
    style?: StyleProp<ViewStyle>
    contentWrapperStyle?: StyleProp<ViewStyle>
    isExternalLink?: boolean
    closable?: boolean
    closeButtonStyle?: ViewStyle
    onClose?: () => void
    onPress?: (event: CarouselPressEvent) => void
    /**
     * Decide when `onPress` is called. Default is `after
     */
    onPressActivation?: "before" | "after"
    name?: string
    children?: React.ReactNode
}

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity)

const routeNameSelector = (state: NavigationState) => state.routes[state.index].name

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
    closable = false,
    onClose,
    closeButtonStyle,
}) => {
    const { styles } = useThemedStyles(baseStyles)
    const nav = useNavigation()
    const route = useNavigationState(routeNameSelector)
    const { navigateWithTab } = useBrowserTab()

    const returnScreen = useMemo(() => {
        if (route === Routes.TOKEN_DETAILS) {
            return Routes.HOME
        }
        return route as Routes.SETTINGS | Routes.HOME | Routes.APPS
    }, [route])

    const onPress = useCallback(
        async function () {
            if (!href) return

            const event: CarouselPressEvent = {
                name: name ?? "",
                defaultPrevented: false,
                preventDefault() {
                    this.defaultPrevented = true
                },
            }

            if (isExternalLink) {
                if (onPressActivation === "before") {
                    propsOnPress?.(event)
                    if (event.defaultPrevented) return
                }
                await Linking.openURL(href)
                if (onPressActivation === "after") propsOnPress?.(event)
            } else {
                if (onPressActivation === "before") {
                    propsOnPress?.(event)
                    if (event.defaultPrevented) return
                }
                navigateWithTab({
                    title: name || href,
                    url: href,
                    navigationFn(u) {
                        nav.navigate(Routes.BROWSER, { url: u, returnScreen })
                    },
                })
                if (onPressActivation === "after") propsOnPress?.(event)
            }
        },
        [href, isExternalLink, onPressActivation, propsOnPress, name, navigateWithTab, nav, returnScreen],
    )

    return (
        <AnimatedTouchableOpacity
            testID={testID}
            style={[styles.container, style]}
            activeOpacity={0.95}
            onPress={onPress}>
            <Animated.View style={[styles.contentWrapper, contentWrapperStyle]}>{children}</Animated.View>
            {closable && (
                <Pressable
                    style={[styles.closeButton, closeButtonStyle]}
                    onPress={onClose}
                    testID="Stargate_banner_close_button">
                    <BaseIcon name="icon-x" size={16} color={COLORS.GREY_100} />
                </Pressable>
            )}
        </AnimatedTouchableOpacity>
    )
}

const baseStyles = () =>
    StyleSheet.create({
        container: {
            flex: 1,
            width: SCREEN_WIDTH,
            pointerEvents: "box-none",
            position: "relative",
        },
        contentWrapper: {
            flex: 1,
            paddingHorizontal: 16,
        },
        closeButton: {
            position: "absolute",
            right: 6,
            top: 6,
            width: 24,
            height: 24,
            alignItems: "center",
            justifyContent: "center",
            zIndex: 4,
        },
    })
