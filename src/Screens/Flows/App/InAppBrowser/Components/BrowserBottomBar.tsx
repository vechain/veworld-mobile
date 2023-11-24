import React, { useMemo } from "react"
import { StyleSheet } from "react-native"
import { BaseIcon, BaseView } from "~Components"
import { useTheme } from "~Hooks"
import { useInAppBrowser } from "~Components/Providers/InAppBrowserProvider"
import { ColorThemeType, DiscoveryDApp } from "~Constants"
import { addBookmark, removeBookmark, selectBookmarkedDapps, useAppDispatch, useAppSelector } from "~Storage/Redux"
import { useNavigation } from "@react-navigation/native"
import { Routes } from "~Navigation"
import axios from "axios"
import { URIUtils } from "~Utils"

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

    const navBack = () => {
        if (nav.canGoBack()) {
            nav.goBack()
        } else {
            nav.navigate(Routes.DISCOVER)
        }
    }

    const toggleBookmark = async () => {
        if (!navigationState?.url) return

        if (isBookMarked) {
            const dapp = dapps.find(bookmark =>
                URIUtils.compareURLs(bookmark.href, URIUtils.clean(navigationState.url)),
            )

            if (dapp) dispatch(removeBookmark(dapp))
        } else {
            const url = new URL(navigationState.url)

            const websiteHtml = await axios.get<string>(url.origin)

            const titleMatch = websiteHtml.data.match(/<title[^>]*>([^<]+)<\/title>/)

            const bookmark: DiscoveryDApp = {
                name: titleMatch ? titleMatch[1] : url.hostname,
                href: navigationState.url,
                desc: "",
                isCustom: true,
                createAt: new Date().getTime(),
                amountOfNavigations: 1,
            }

            dispatch(addBookmark(bookmark))
        }
    }

    return (
        <BaseView style={styles.bottomBar}>
            <BaseIcon
                color={theme.colors.primary}
                name="arrow-left-thick"
                onPress={goBack}
                style={canGoBack ? styles.icon : styles.disabledIcon}
                disabled={!canGoBack}
            />

            <BaseIcon
                color={theme.colors.primary}
                onPress={goForward}
                name="arrow-right-thick"
                style={canGoForward ? styles.icon : styles.disabledIcon}
                disabled={!canGoForward}
            />

            <BaseIcon color={theme.colors.primary} onPress={navBack} name="home" style={styles.icon} />

            <BaseIcon
                color={theme.colors.primary}
                onPress={toggleBookmark}
                name={isBookMarked ? "bookmark" : "bookmark-outline"}
                style={styles.icon}
            />

            <BaseIcon
                name={"refresh"}
                onPress={webviewRef.current?.reload}
                color={theme.colors.primary}
                style={styles.icon}
            />
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
            paddingVertical: 10,
            height: 60,
            borderTopWidth: 1,
        },
        icon: {
            fontSize: 24,
            color: theme.colors.primary,
            elevation: 3, // Add shadow for depth (Android)
            shadowColor: "#000", // Shadow color (iOS)
            shadowOffset: { width: 0, height: 1 }, // Shadow position (iOS)
            shadowOpacity: 0.3, // Shadow opacity (iOS)
            shadowRadius: 2, // Shadow blur radius (iOS)
        },
        disabledIcon: {
            fontSize: 24,
            color: theme.colors.disabled,
            opacity: 0.5,
        },
        touchArea: {
            borderRadius: 20, // Rounded corners for the touchable area
            padding: 8, // Padding to increase touchable area
        },
    })
