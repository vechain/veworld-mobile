import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import { useNavigation } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { default as React, useCallback, useMemo, useState } from "react"
import { Share, StyleSheet } from "react-native"
import { BaseBottomSheet, BaseIcon, BaseSpacer, BaseText, BaseTouchable, BaseView } from "~Components/Base"
import { useInAppBrowser } from "~Components/Providers"
import { Feedback } from "~Components/Providers/FeedbackProvider/Events"
import { FeedbackSeverity, FeedbackType } from "~Components/Providers/FeedbackProvider/Model"
import { ColorThemeType, SCREEN_HEIGHT } from "~Constants"
import { useDappBookmarkToggle, useTabManagement, useThemedStyles } from "~Hooks"
import { useI18nContext } from "~i18n"
import { IconKey } from "~Model"
import { RootStackParamListApps, RootStackParamListSettings, Routes } from "~Navigation"
import { selectCurrentTabId, useAppSelector } from "~Storage/Redux"

type Props = {
    onNavigate?: () => void | Promise<void>
    onClose?: () => void
}

type BottomSheetActionSeparator = {
    type: "separator"
    id: string
}

type BottomSheetAction = {
    type: "action"
    id: string
    icon: IconKey
    label: string
    onPress: () => void
    disabled?: boolean
}

type BottomSheetActionItem = BottomSheetActionSeparator | BottomSheetAction

export const getActionTextColor = (
    action: BottomSheetAction,
    theme: { colors: { actionBottomSheet: { disabledText: string; dangerText: string; text: string } } },
) => {
    if (action.disabled) {
        return theme.colors.actionBottomSheet.disabledText
    }
    if (action.id === "close-tab") {
        return theme.colors.actionBottomSheet.dangerText
    }
    return theme.colors.actionBottomSheet.text
}

export const BrowserBottomSheet = React.forwardRef<BottomSheetModalMethods, Props>(({ onNavigate, onClose }, ref) => {
    const { LL } = useI18nContext()
    const { navigationState, webviewRef, dappMetadata } = useInAppBrowser()
    const { isBookMarked, toggleBookmark } = useDappBookmarkToggle(navigationState?.url)
    const { styles, theme } = useThemedStyles(baseStyles)
    const nav = useNavigation<NativeStackNavigationProp<RootStackParamListSettings & RootStackParamListApps>>()
    const { closeTab } = useTabManagement()
    const currentTabId = useAppSelector(selectCurrentTabId)
    const [actionContainerHeight, setActionContainerHeight] = useState(SCREEN_HEIGHT / 2)

    const navToTabsManager = useCallback(async () => {
        await onNavigate?.()
        nav.replace(Routes.APPS_TABS_MANAGER)
        onClose?.()
    }, [nav, onNavigate, onClose])

    const navToNewTab = useCallback(async () => {
        await onNavigate?.()
        nav.replace(Routes.APPS_SEARCH)
        onClose?.()
    }, [nav, onNavigate, onClose])

    const navToSearch = useCallback(() => {
        nav.replace(Routes.APPS_SEARCH)
    }, [nav])

    const closeCurrentTab = useCallback(() => {
        if (currentTabId) {
            closeTab(currentTabId)
            navToSearch()
        }
    }, [currentTabId, closeTab, navToSearch])

    const clearCache = useCallback(() => {
        webviewRef.current?.clearCache?.(true)
        Feedback.show({
            message: LL.CACHE_CLEARED(),
            severity: FeedbackSeverity.SUCCESS,
            icon: "icon-check",
            type: FeedbackType.ALERT,
        })
    }, [LL, webviewRef])

    const actions: BottomSheetActionItem[] = useMemo(() => {
        const favoriteItem: BottomSheetAction = isBookMarked
            ? {
                  type: "action",
                  id: "favorite",
                  icon: "icon-star-on",
                  label: LL.BROWSER_REMOVE_FAVORITE_DAPPS(),
                  onPress: toggleBookmark,
              }
            : {
                  type: "action",
                  id: "favorite",
                  icon: "icon-star",
                  label: LL.BROWSER_ADD_FAVORITE_DAPPS(),
                  onPress: toggleBookmark,
              }

        return [
            {
                type: "action",
                id: "go-back",
                icon: "icon-chevron-left",
                label: LL.BROWSER_GO_BACK(),
                disabled: !navigationState?.canGoBack,
                onPress: () => {
                    webviewRef.current?.goBack()
                    onClose?.()
                },
            },
            {
                type: "action",
                id: "reload",
                icon: "icon-retry",
                label: LL.BROWSER_RELOAD_PAGE(),
                onPress: () => {
                    webviewRef.current?.reload()
                    onClose?.()
                },
            },
            favoriteItem,
            {
                type: "action",
                id: "share",
                icon: "icon-share-2",
                label: LL.BROWSER_SHARE(),
                onPress: () => {
                    if (!navigationState?.url || !dappMetadata) return
                    const url = new URL(dappMetadata.url).origin
                    Share.share({
                        message: LL.SHARE_DAPP({
                            name: dappMetadata.name,
                            description: dappMetadata.description ?? "",
                            url,
                        }),
                        url,
                    })
                },
            },
            {
                type: "separator",
                id: "separator-1",
            },
            {
                type: "action",
                id: "new-tab",
                icon: "icon-plus",
                label: LL.BROWSER_NEW_TAB(),
                onPress: () => navToNewTab(),
            },
            {
                type: "action",
                id: "tabs",
                icon: "icon-copy",
                label: LL.BROWSER_SEE_ALL_TABS(),
                onPress: () => navToTabsManager(),
            },
            {
                type: "action",
                id: "cache-clear",
                icon: "icon-trash-2",
                label: LL.BROWSER_CLEAR_CACHE(),
                onPress: () => clearCache(),
            } satisfies BottomSheetAction,
            {
                type: "action",
                id: "close-tab",
                icon: "icon-x",
                label: LL.BROWSER_CLOSE_TAB(),
                onPress: () => closeCurrentTab(),
            },
        ]
    }, [
        isBookMarked,
        LL,
        toggleBookmark,
        navigationState?.canGoBack,
        navigationState?.url,
        webviewRef,
        onClose,
        dappMetadata,
        navToNewTab,
        navToTabsManager,
        clearCache,
        closeCurrentTab,
    ])

    const calculateActionContainerHeight = (height: number) => {
        setActionContainerHeight(height)
    }

    const snapPoints = useMemo(() => {
        const heightPercentage = (actionContainerHeight * 100) / SCREEN_HEIGHT
        //This will keep the bottom sheet content inside the padding of the bottom sheet
        return [`${Math.ceil(heightPercentage + actions.length - 1)}%`]
    }, [actionContainerHeight, actions.length])

    return (
        <BaseBottomSheet
            ref={ref}
            snapPoints={snapPoints}
            blurBackdrop
            floating
            backgroundStyle={styles.rootSheet}
            noMargins>
            <BaseView
                w={100}
                onLayout={e => calculateActionContainerHeight(e.nativeEvent.layout.height)}
                style={styles.actionContainer}>
                {actions.map(action =>
                    action.type === "action" ? (
                        <BaseTouchable
                            key={action.id}
                            style={styles.actionItemContainer}
                            action={action.onPress}
                            disabled={action.disabled}>
                            <BaseIcon
                                name={action.icon}
                                size={16}
                                iconPadding={8}
                                disabled={action.disabled}
                                bg={theme.colors.actionBottomSheet.dangerIconBackground}
                                color={
                                    action.id === "close-tab"
                                        ? theme.colors.actionBottomSheet.dangerIcon
                                        : theme.colors.actionBottomSheet.icon
                                }
                            />
                            <BaseText typographyFont="bodySemiBold" color={getActionTextColor(action, theme)}>
                                {action.label}
                            </BaseText>
                        </BaseTouchable>
                    ) : (
                        <BaseSpacer
                            key={action.id}
                            height={1}
                            background={theme.colors.actionBottomSheet.dangerIconBackground}
                            my={10}
                        />
                    ),
                )}
            </BaseView>
        </BaseBottomSheet>
    )
})

const baseStyles = (theme: ColorThemeType) => {
    return StyleSheet.create({
        actionContainer: {
            flexDirection: "column",
            gap: 4,
            paddingHorizontal: 24,
            paddingBottom: 24,
        },
        actionItemContainer: {
            gap: 24,
            flexDirection: "row",
            alignItems: "center",
            width: "100%",
            paddingVertical: 6,
        },
        rootSheet: {
            backgroundColor: theme.colors.actionBottomSheet.background,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
        },
    })
}
