import React, { useCallback, useMemo } from "react"
import { StyleSheet } from "react-native"
import { BaseIcon, BaseView } from "~Components"
import { useTheme } from "~Hooks"
import { useInAppBrowser } from "~Components/Providers/InAppBrowserProvider"
import { ColorThemeType, DiscoveryDApp } from "~Constants"
import {
    addBookmark,
    removeBookmark,
    selectAllDapps,
    selectBookmarkedDapps,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"
import { URIUtils } from "~Utils"

type IconProps = {
    name: string
    onPress: () => void
    disabled?: boolean
}

export const BrowserBottomBar: React.FC = () => {
    const { canGoBack, canGoForward, goBack, goForward, navigationState, webviewRef } = useInAppBrowser()
    const theme = useTheme()
    const styles = createStyles(theme)
    const dispatch = useAppDispatch()

    const bookmarkedDapps: DiscoveryDApp[] = useAppSelector(selectBookmarkedDapps)
    const allDApps = useAppSelector(selectAllDapps)

    const existingBookmark = useMemo(() => {
        if (!navigationState?.url) return undefined

        try {
            return bookmarkedDapps.find(bookmark =>
                URIUtils.compareURLs(URIUtils.clean(bookmark.href), URIUtils.clean(navigationState.url)),
            )
        } catch {
            return undefined
        }
    }, [bookmarkedDapps, navigationState])

    const isBookMarked = useMemo(() => {
        return !!existingBookmark
    }, [existingBookmark])

    const toggleBookmark = useCallback(async () => {
        if (!navigationState?.url) return

        if (existingBookmark) {
            dispatch(removeBookmark(existingBookmark))
        } else {
            const existingDApp = allDApps.find(dapp =>
                URIUtils.compareURLs(URIUtils.clean(dapp.href), URIUtils.clean(navigationState.url)),
            )

            if (existingDApp) {
                return dispatch(addBookmark(existingDApp))
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
        }
    }, [dispatch, existingBookmark, navigationState, allDApps])

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
            color: theme.colors.primary,
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
