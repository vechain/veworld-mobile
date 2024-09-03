import React, { useCallback, useEffect, useMemo } from "react"
import { BackHandler, StyleSheet } from "react-native"
import { BaseIcon, BaseView, useInAppBrowser } from "~Components"
import { ColorThemeType } from "~Constants"
import { useBlockchainNetwork, useDappBookmarking, useTheme, useThemedStyles } from "~Hooks"
import { isIOS } from "~Utils/PlatformUtils/PlatformUtils"

type IconProps = {
    name: string
    onPress: () => void
    disabled?: boolean
}

export const BrowserBottomBar: React.FC = () => {
    const {
        navigationCanGoBack,
        canGoBack,
        canGoForward,
        closeInAppBrowser,
        goBack,
        goForward,
        navigationState,
        webviewRef,
    } = useInAppBrowser()
    const theme = useTheme()
    const { isBookMarked, toggleBookmark } = useDappBookmarking(navigationState?.url)
    const { isMainnet } = useBlockchainNetwork()
    const { styles } = useThemedStyles(baseStyles(isMainnet))

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
    }, [canGoBack, closeInAppBrowser, goBack, navigationCanGoBack])

    useEffect(() => {
        const sub = BackHandler.addEventListener("hardwareBackPress", onBackHandler)
        return () => sub.remove()
    }, [onBackHandler])

    const IconConfig: IconProps[] = useMemo(() => {
        return [
            {
                name: "chevron-left",
                onPress: onBackHandler,
                disabled: !canGoBack,
            },
            {
                name: "chevron-right",
                onPress: goForward,
                disabled: !canGoForward,
            },
            {
                name: isBookMarked ? "bookmark" : "bookmark-outline",
                onPress: toggleBookmark,
            },
            {
                name: "refresh",
                onPress: () => webviewRef.current?.reload(),
            },
        ]
    }, [canGoBack, canGoForward, goForward, isBookMarked, onBackHandler, toggleBookmark, webviewRef])

    return navigationState?.url ? (
        <BaseView style={styles.bottomBar}>
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
        </BaseView>
    ) : null
}

const baseStyles = (isMainnet: boolean) => (theme: ColorThemeType) =>
    StyleSheet.create({
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
