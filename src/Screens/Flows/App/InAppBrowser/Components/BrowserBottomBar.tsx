import React, { useMemo } from "react"
import { StyleSheet } from "react-native"
import { BaseIcon, BaseView } from "~Components"
import { useDappBookmarking, useTheme } from "~Hooks"
import { useInAppBrowser } from "~Components/Providers/InAppBrowserProvider"
import { ColorThemeType } from "~Constants"

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

    return (
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
            height: 85,
            borderTopWidth: 1,
        },
        icon: {
            fontSize: 40,
            borderRadius: 10,
            paddingHorizontal: 12,
            paddingBottom: 25,
        },
        disabledIcon: {
            fontSize: 40,
            color: theme.colors.disabled,
            opacity: 0.5,
        },
    })
