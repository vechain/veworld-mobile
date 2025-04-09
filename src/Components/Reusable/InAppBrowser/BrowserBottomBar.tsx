import { useRoute } from "@react-navigation/native"
import React, { useCallback, useEffect, useMemo } from "react"
import { BackHandler, StyleSheet } from "react-native"
import Animated, { useAnimatedStyle, withTiming } from "react-native-reanimated"
import { BaseIcon, useInAppBrowser } from "~Components"
import { ColorThemeType } from "~Constants"
import { useBottomSheetModal, useDappBookmarking, useTheme, useThemedStyles } from "~Hooks"
import { IconKey } from "~Model"
import { Routes } from "~Navigation"
import { isIOS } from "~Utils/PlatformUtils/PlatformUtils"
import { BrowserBottomSheet } from "./BrowserBottomSheet"

type IconProps = {
    name: IconKey
    onPress: () => void
    disabled?: boolean
}

export const BrowserBottomBar: React.FC = () => {
    const {
        showToolbars,
        navigationCanGoBack,
        canGoBack,
        canGoForward,
        closeInAppBrowser,
        goBack,
        goForward,
        navigationState,
        webviewRef,
        isDapp,
    } = useInAppBrowser()
    const theme = useTheme()
    const { isBookMarked, toggleBookmark } = useDappBookmarking(navigationState?.url)
    const { styles } = useThemedStyles(baseStyles)
    const isIOSPlatform = isIOS()
    const route = useRoute()
    const { onClose: closeBottomSheet, onOpen: openBottomSheet, ref: bottomSheetRef } = useBottomSheetModal()

    const fromDiscovery = useMemo(() => {
        return route.name !== Routes.SETTINGS_GET_SUPPORT && route.name !== Routes.SETTINGS_GIVE_FEEDBACK
    }, [route.name])

    const animatedStyles = useAnimatedStyle(() => {
        const parsedPadding = isIOSPlatform ? 20 : 8

        return {
            opacity: showToolbars ? withTiming(1) : withTiming(0),
            height: showToolbars ? withTiming(56) : withTiming(0),
            paddingTop: showToolbars ? withTiming(8) : withTiming(0),
            paddingBottom: showToolbars ? withTiming(parsedPadding) : withTiming(0),
        }
    }, [isIOSPlatform, showToolbars])

    const onBackHandler = useCallback(() => {
        if (canGoBack) {
            goBack()
            return true
        }

        if (navigationCanGoBack) {
            closeInAppBrowser()
            return true
        }

        return false
    }, [canGoBack, navigationCanGoBack, goBack, closeInAppBrowser])

    useEffect(() => {
        const sub = BackHandler.addEventListener("hardwareBackPress", onBackHandler)
        return () => sub.remove()
    }, [onBackHandler])

    const IconConfig: IconProps[] = useMemo(() => {
        return [
            {
                name: "icon-chevron-left",
                onPress: onBackHandler,
                disabled: !canGoBack,
            },
            {
                name: "icon-chevron-right",
                onPress: goForward,
                disabled: !canGoForward,
            },
            ...(isDapp
                ? [
                      {
                          name: isBookMarked ? ("icon-star-on" as const) : ("icon-star" as const),
                          onPress: () => {
                              toggleBookmark()
                          },
                          disabled: !fromDiscovery,
                      },
                  ]
                : []),
            {
                name: "icon-retry",
                onPress: () => webviewRef.current?.reload(),
            },
            {
                name: "icon-more-vertical",
                onPress: openBottomSheet,
            },
        ]
    }, [
        canGoBack,
        canGoForward,
        fromDiscovery,
        goForward,
        isBookMarked,
        isDapp,
        onBackHandler,
        openBottomSheet,
        toggleBookmark,
        webviewRef,
    ])

    return navigationState?.url ? (
        <Animated.View style={[styles.bottomBar, styles.animatedContainer, animatedStyles]}>
            {IconConfig.map((config, index) => {
                return (
                    <BaseIcon
                        key={`${config.name}-${index}`}
                        action={config.onPress}
                        disabled={config.disabled}
                        name={config.name}
                        size={20}
                        color={theme.colors.text}
                    />
                )
            })}
            <BrowserBottomSheet onClose={closeBottomSheet} ref={bottomSheetRef} />
        </Animated.View>
    ) : null
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        animatedContainer: {},
        bottomBar: {
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            backgroundColor: theme.colors.background,
            borderTopColor: theme.colors.card,
            borderTopWidth: 1,
            paddingHorizontal: 16,
            ...(isIOS() ? { marginBottom: 15 } : {}),
        },
        icon: {
            borderRadius: 10,
            padding: 10,
        },
    })
