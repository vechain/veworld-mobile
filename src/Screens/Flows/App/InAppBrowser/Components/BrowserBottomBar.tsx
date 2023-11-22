import React, { useMemo } from "react"
import { StyleSheet } from "react-native"
import { BaseIcon, BaseView } from "~Components"
import { useTheme } from "~Hooks"
import { DISCOVER_HOME_URL, useInAppBrowser } from "~Components/Providers/InAppBrowserProvider"
import { ColorThemeType } from "~Constants"
import { selectBookmarks, useAppSelector } from "~Storage/Redux"

type IBrowserBottomBar = {
    onTabClick: () => void
    onFavouriteClick: () => void
}

export const BrowserBottomBar: React.FC<IBrowserBottomBar> = ({ onTabClick, onFavouriteClick }) => {
    const { canGoBack, canGoForward, goBack, goForward, goHome, navigationState } = useInAppBrowser()
    const theme = useTheme()
    const styles = createStyles(theme)

    const bookmarks = useAppSelector(selectBookmarks)

    const isBookMarked = useMemo(() => {
        return !!navigationState?.url && bookmarks.includes(navigationState?.url)
    }, [navigationState?.url, bookmarks])

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

            <BaseIcon
                color={theme.colors.primary}
                onPress={goHome}
                name="home"
                style={styles.icon}
                disabled={navigationState?.url === DISCOVER_HOME_URL}
            />

            <BaseIcon
                color={theme.colors.primary}
                onPress={onFavouriteClick}
                name={isBookMarked ? "star" : "star-outline"}
                style={styles.icon}
            />

            <BaseIcon name={"tab"} onPress={onTabClick} color={theme.colors.primary} style={styles.icon} />
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
