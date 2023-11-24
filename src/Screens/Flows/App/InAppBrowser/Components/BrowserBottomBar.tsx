import React, { useCallback, useMemo } from "react"
import { StyleSheet } from "react-native"
import { BaseIcon, BaseTouchable, BaseView } from "~Components"
import { useTheme } from "~Hooks"
import { useInAppBrowser } from "~Components/Providers/InAppBrowserProvider"
import { ColorThemeType, DiscoveryDApp } from "~Constants"
import { addBookmark, removeBookmark, selectBookmarkedDapps, useAppDispatch, useAppSelector } from "~Storage/Redux"
import { useNavigation } from "@react-navigation/native"
import { Routes } from "~Navigation"
import { URIUtils } from "~Utils"

type IconProps = {
    name: string
    onPress: () => void
    color: string
    style: any
    disabled: boolean
}

export const BrowserBottomBar: React.FC = () => {
    const { canGoBack, canGoForward, goBack, goForward, navigationState, webviewRef } = useInAppBrowser()
    const theme = useTheme()
    const styles = createStyles(theme)
    const nav = useNavigation()
    const dispatch = useAppDispatch()

    const dapps: DiscoveryDApp[] = useAppSelector(selectBookmarkedDapps)

    const isBookMarked = useMemo(() => {
        if (!navigationState?.url) return false

        try {
            return dapps.some(bookmark => URIUtils.compareURLs(bookmark.href, URIUtils.clean(navigationState.url)))
        } catch {
            return false
        }
    }, [navigationState?.url, dapps])

    const navBack = useCallback(() => {
        if (nav.canGoBack()) {
            nav.goBack()
        } else {
            nav.navigate(Routes.DISCOVER)
        }
    }, [nav])

    const toggleBookmark = useCallback(async () => {
        if (!navigationState?.url) return

        if (isBookMarked) {
            const dapp = dapps.find(bookmark =>
                URIUtils.compareURLs(bookmark.href, URIUtils.clean(navigationState.url)),
            )

            if (dapp) dispatch(removeBookmark(dapp))
        } else {
            const url = new URL(navigationState.url)

            const bookmark: DiscoveryDApp = {
                name: navigationState.title,
                href: URIUtils.clean(url.href),
                desc: "",
                isCustom: true,
                createAt: new Date().getTime(),
                amountOfNavigations: 1,
            }

            dispatch(addBookmark(bookmark))
        }
    }, [dispatch, dapps, isBookMarked, navigationState])

    const IconConfig: IconProps[] = useMemo(() => {
        return [
            {
                name: "arrow-left-thick",
                onPress: goBack,
                color: theme.colors.primary,
                style: canGoBack ? styles.icon : styles.disabledIcon,
                disabled: !canGoBack,
            },
            {
                name: "arrow-right-thick",
                onPress: goForward,
                color: theme.colors.primary,
                style: canGoForward ? styles.icon : styles.disabledIcon,
                disabled: !canGoForward,
            },
            {
                name: "home",
                onPress: navBack,
                color: theme.colors.primary,
                style: styles.icon,
                disabled: false,
            },
            {
                name: isBookMarked ? "bookmark" : "bookmark-outline",
                onPress: toggleBookmark,
                color: theme.colors.primary,
                style: styles.icon,
                disabled: false,
            },
            {
                name: "refresh",
                onPress: () => webviewRef.current?.reload(),
                color: theme.colors.primary,
                style: styles.icon,
                disabled: false,
            },
        ]
    }, [
        canGoBack,
        canGoForward,
        goBack,
        goForward,
        isBookMarked,
        navBack,
        styles.disabledIcon,
        styles.icon,
        theme.colors.primary,
        toggleBookmark,
        webviewRef,
    ])

    return (
        <BaseView style={styles.bottomBar}>
            {IconConfig.map((config, index) => {
                return (
                    <BaseTouchable key={`${config.name}-${index}`} style={styles.container} onPress={config.onPress}>
                        <BaseIcon color={config.color} name={config.name} style={config.style} />
                    </BaseTouchable>
                )
            })}
        </BaseView>
    )
}

const createStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        bottomBar: {
            flexDirection: "row",
            justifyContent: "space-evenly",
            alignItems: "center",
            backgroundColor: theme.colors.background,
            paddingBottom: 10,
            height: 70,
            borderTopWidth: 1,
        },
        icon: {
            fontSize: 24,
            color: theme.colors.primary,
            elevation: 3, // Add shadow for depth (Android)
        },
        disabledIcon: {
            fontSize: 24,
            color: theme.colors.disabled,
            opacity: 0.5,
        },
        container: {
            borderRadius: 10,
            paddingHorizontal: 12,
            paddingVertical: 8.5,
        },
    })
