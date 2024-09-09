import React, { useMemo } from "react"
import { StyleSheet } from "react-native"
import { BaseIcon, useInAppBrowser } from "~Components"
import { useBlockchainNetwork, useDappBookmarking, useTheme, useThemedStyles } from "~Hooks"
import { ColorThemeType } from "~Constants"
import { isIOS } from "~Utils/PlatformUtils/PlatformUtils"
import Animated, { useAnimatedStyle, withTiming } from "react-native-reanimated"
import { useRoute } from "@react-navigation/native"
import { Routes } from "~Navigation"

type IconProps = {
    name: string
    onPress: () => void
    disabled?: boolean
}

export const BrowserBottomBar: React.FC = () => {
    const { showToolbars, canGoBack, canGoForward, goBack, goForward, navigationState, webviewRef } = useInAppBrowser()
    const theme = useTheme()
    const { isBookMarked, toggleBookmark } = useDappBookmarking(navigationState?.url)
    const { isMainnet } = useBlockchainNetwork()
    const { styles } = useThemedStyles(baseStyles(isMainnet))
    const isIOSPlatform = isIOS()
    const route = useRoute()

    const fromDiscovery = useMemo(() => {
        return route.name !== Routes.SETTINGS_GET_SUPPORT && route.name !== Routes.SETTINGS_GIVE_FEEDBACK
    }, [route.name])

    const animatedStyles = useAnimatedStyle(() => {
        const parsedPadding = isIOSPlatform ? 42 : 10

        return {
            transform: [{ translateY: showToolbars ? withTiming(0) : withTiming(40) }],
            opacity: showToolbars ? withTiming(1) : withTiming(0),
            paddingTop: showToolbars ? withTiming(10) : withTiming(0),
            paddingBottom: showToolbars ? withTiming(parsedPadding) : withTiming(0),
        }
    })

    const IconConfig: IconProps[] = useMemo(() => {
        return [
            {
                name: "chevron-left",
                onPress: goBack,
                disabled: !canGoBack,
            },
            {
                name: "chevron-right",
                onPress: goForward,
                disabled: !canGoForward,
            },
            {
                name: isBookMarked ? "bookmark" : "bookmark-outline",
                onPress: () => {
                    toggleBookmark()
                },
                disabled: !fromDiscovery,
            },
            {
                name: "refresh",
                onPress: () => webviewRef.current?.reload(),
            },
        ]
    }, [canGoBack, canGoForward, fromDiscovery, goBack, goForward, isBookMarked, toggleBookmark, webviewRef])

    return navigationState?.url ? (
        <Animated.View style={[styles.bottomBar, styles.animatedContainer, animatedStyles]}>
            {IconConfig.map((config, index) => {
                return (
                    <BaseIcon
                        key={`${config.name}-${index}`}
                        action={config.onPress}
                        disabled={config.disabled}
                        name={config.name}
                        style={styles.icon}
                        size={32}
                        color={theme.colors.text}
                    />
                )
            })}
        </Animated.View>
    ) : null
}

const baseStyles = (isMainnet: boolean) => (theme: ColorThemeType) =>
    StyleSheet.create({
        animatedContainer: {
            opacity: 1,
        },
        bottomBar: {
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-evenly",
            alignItems: "center",
            backgroundColor: isMainnet ? theme.colors.background : theme.colors.testnetBackground,
            borderTopColor: isMainnet ? theme.colors.card : theme.colors.testnetBackground,
            borderTopWidth: 1,
            paddingTop: 10,
            paddingBottom: isIOS() ? 42 : 10,
        },
        icon: {
            fontSize: 40,
            borderRadius: 10,
            paddingHorizontal: 12,
        },
        disabledIcon: {
            fontSize: 40,
            color: theme.colors.disabled,
            opacity: 0.5,
        },
    })
