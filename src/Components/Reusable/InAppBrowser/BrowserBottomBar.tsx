import { useRoute } from "@react-navigation/native"
import React, { useCallback, useEffect, useMemo } from "react"
import { BackHandler, StyleSheet } from "react-native"
import Animated, { useAnimatedStyle, withTiming } from "react-native-reanimated"
import { BaseIcon, useInAppBrowser } from "~Components"
import { COLORS, ColorThemeType } from "~Constants"
import { useBlockchainNetwork, useBottomSheetModal, useDappBookmarking, useTheme, useThemedStyles } from "~Hooks"
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
    const { isMainnet } = useBlockchainNetwork()
    const { styles } = useThemedStyles(baseStyles(isMainnet))
    const isIOSPlatform = isIOS()
    const route = useRoute()
    const { onClose: closeBottomSheet, onOpen: openBottomSheet, ref: bottomSheetRef } = useBottomSheetModal()

    const fromDiscovery = useMemo(() => {
        return route.name !== Routes.SETTINGS_GET_SUPPORT && route.name !== Routes.SETTINGS_GIVE_FEEDBACK
    }, [route.name])

    const animatedStyles = useAnimatedStyle(() => {
        const parsedPadding = isIOSPlatform ? 40 : 8

        return {
            transform: [{ translateY: showToolbars ? withTiming(0) : withTiming(56) }],
            opacity: showToolbars ? withTiming(1) : withTiming(0),
            paddingTop: showToolbars ? withTiming(8) : withTiming(0),
            paddingBottom: showToolbars ? withTiming(parsedPadding) : withTiming(0),
        }
    })

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
                          name: isBookMarked ? ("icon-star-on" as const) : ("icon-star-off" as const),
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
                        style={styles.icon}
                        size={20}
                        color={isMainnet ? theme.colors.text : COLORS.WHITE}
                    />
                )
            })}
            <BrowserBottomSheet onClose={closeBottomSheet} ref={bottomSheetRef} />
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
            justifyContent: "space-between",
            alignItems: "center",
            backgroundColor: isMainnet ? theme.colors.background : theme.colors.testnetBackground,
            borderTopColor: isMainnet ? theme.colors.card : theme.colors.testnetBackground,
            borderTopWidth: 1,
            paddingHorizontal: 16,
        },
        icon: {
            borderRadius: 10,
            padding: 10,
        },
    })
