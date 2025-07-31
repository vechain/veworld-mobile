import { useRoute } from "@react-navigation/native"
import React, { useCallback, useEffect, useMemo } from "react"
import { BackHandler, StyleSheet } from "react-native"
import Animated, { useAnimatedStyle, withTiming } from "react-native-reanimated"
import { BaseIcon, useInAppBrowser } from "~Components"
import { AnalyticsEvent, COLORS, ColorThemeType } from "~Constants"
import { useAnalyticTracking, useBottomSheetModal, useDappBookmarking, useTheme, useThemedStyles } from "~Hooks"
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
    const track = useAnalyticTracking()
    const { onOpen: openBottomSheet, ref: bottomSheetRef } = useBottomSheetModal()

    const fromDiscovery = useMemo(() => {
        return route.name !== Routes.SETTINGS_GET_SUPPORT && route.name !== Routes.SETTINGS_GIVE_FEEDBACK
    }, [route.name])

    const animatedStyles = useAnimatedStyle(() => {
        return {
            opacity: showToolbars ? withTiming(1) : withTiming(0),
            height: showToolbars ? withTiming(56) : withTiming(0),
            paddingTop: showToolbars ? withTiming(8) : withTiming(0),
            paddingBottom: showToolbars ? withTiming(8) : withTiming(0),
        }
    }, [isIOSPlatform, showToolbars])

    const onBackHandler = useCallback(() => {
        track(AnalyticsEvent.BROWSER_GO_BACK_CLICKED)
        if (canGoBack) {
            goBack()
            return true
        }

        if (navigationCanGoBack) {
            closeInAppBrowser()
            return true
        }

        return false
    }, [track, canGoBack, navigationCanGoBack, goBack, closeInAppBrowser])

    const onForwardHandler = useCallback(() => {
        track(AnalyticsEvent.BROWSER_GO_FORWARD_CLICKED)
        goForward()
    }, [track, goForward])

    const iconColor = useMemo(() => (theme.isDark ? COLORS.PRIMARY_200 : COLORS.GREY_600), [theme.isDark])

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
                onPress: onForwardHandler,
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
        onForwardHandler,
        isBookMarked,
        isDapp,
        onBackHandler,
        openBottomSheet,
        toggleBookmark,
        webviewRef,
    ])

    return navigationState?.url ? (
        <Animated.View testID="browser-bottom-bar" style={[styles.bottomBar, styles.animatedContainer, animatedStyles]}>
            {IconConfig.map((config, index) => {
                return (
                    <BaseIcon
                        testID={`browser-bottom-bar-icon-${config.name}`}
                        key={`${config.name}-${index}`}
                        action={config.onPress}
                        disabled={config.disabled}
                        name={config.name}
                        size={20}
                        color={iconColor}
                        style={styles.icon}
                    />
                )
            })}
            <BrowserBottomSheet ref={bottomSheetRef} />
        </Animated.View>
    ) : null
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        animatedContainer: {
            backgroundColor: theme.colors.background,
            ...(isIOS() ? { marginBottom: 34 } : {}),
        },
        bottomBar: {
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            backgroundColor: theme.colors.tabsFooter.background,
            paddingHorizontal: 16,
        },
        icon: {
            borderRadius: 10,
            padding: 10,
        },
    })
