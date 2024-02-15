import React, { useMemo } from "react"
import { StyleSheet } from "react-native"
import { BaseIcon, BaseView } from "~Components"
import { useDappBookmarking, useTheme } from "~Hooks"
import { useInAppBrowser } from "~Components/Providers/InAppBrowserProvider"
import { ColorThemeType } from "~Constants"
import { isIOS } from "~Utils/PlatformUtils/PlatformUtils"

type IconProps = {
    name: string
    onPress: () => void
    disabled?: boolean
}

export const BrowserBottomBar: React.FC = () => {
    const { canGoBack, canGoForward, goBack, goForward, navigationState, webviewRef } = useInAppBrowser()
    const theme = useTheme()
    const styles = createStyles(theme)

    const { isBookMarked, toggleBookmark } = useDappBookmarking(navigationState?.url, navigationState?.title)

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
                onPress: toggleBookmark,
            },
            {
                name: "refresh",
                onPress: () => webviewRef.current?.reload(),
            },
        ]
    }, [canGoBack, canGoForward, goBack, goForward, isBookMarked, toggleBookmark, webviewRef])

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

const createStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        bottomBar: {
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-evenly",
            alignItems: "center",
            backgroundColor: theme.colors.background,
            borderTopColor: theme.colors.card,
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
