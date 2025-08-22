import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import { useNavigation } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { default as React, useCallback, useMemo, useState } from "react"
import { Share, StyleSheet } from "react-native"
import { BaseBottomSheet, BaseIcon, BaseSpacer, BaseText, BaseTouchable, BaseView } from "~Components/Base"
import { useFeatureFlags, useInAppBrowser } from "~Components/Providers"
import { ColorThemeType, SCREEN_HEIGHT } from "~Constants"
import { useDappBookmarking, useThemedStyles } from "~Hooks"
import { useI18nContext } from "~i18n"
import { IconKey } from "~Model"
import { RootStackParamListApps, RootStackParamListBrowser, RootStackParamListSettings, Routes } from "~Navigation"
import { closeTab, selectCurrentTabId, useAppDispatch, useAppSelector } from "~Storage/Redux"

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
}

type BottomSheetActionItem = BottomSheetActionSeparator | BottomSheetAction

export const BrowserBottomSheet = React.forwardRef<BottomSheetModalMethods, Props>(({ onNavigate, onClose }, ref) => {
    const { LL } = useI18nContext()
    const { isDapp, navigationState, webviewRef } = useInAppBrowser()
    const { isBookMarked, toggleBookmark } = useDappBookmarking(navigationState?.url)
    const { styles, theme } = useThemedStyles(baseStyles)
    const nav =
        useNavigation<
            NativeStackNavigationProp<RootStackParamListBrowser & RootStackParamListSettings & RootStackParamListApps>
        >()
    const dispatch = useAppDispatch()
    const currentTabId = useAppSelector(selectCurrentTabId)
    const { betterWorldFeature } = useFeatureFlags()
    const [actionContainerHeight, setActionContainerHeight] = useState(SCREEN_HEIGHT / 2)

    const navToTabsManager = useCallback(async () => {
        await onNavigate?.()
        if (betterWorldFeature.appsScreen.enabled) {
            nav.replace(Routes.APPS_TABS_MANAGER)
        } else {
            nav.replace(Routes.DISCOVER_TABS_MANAGER)
        }
        onClose?.()
    }, [nav, onNavigate, onClose, betterWorldFeature.appsScreen.enabled])

    const navToNewTab = useCallback(async () => {
        await onNavigate?.()
        if (betterWorldFeature.appsScreen.enabled) {
            nav.replace(Routes.APPS_SEARCH)
        } else {
            nav.replace(Routes.DISCOVER_SEARCH)
        }
        onClose?.()
    }, [nav, onNavigate, onClose, betterWorldFeature.appsScreen.enabled])

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
            ...(isDapp ? [favoriteItem] : []),
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
            {
                type: "action",
                id: "share",
                icon: "icon-share-2",
                label: LL.BROWSER_SHARE(),
                onPress: () => {
                    Share.share({
                        message: navigationState?.title || new URL(navigationState?.url || "").href,
                        url: navigationState?.url ?? "",
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
                id: "close-tab",
                icon: "icon-x",
                label: LL.BROWSER_CLOSE_TAB(),
                onPress: () => {
                    if (currentTabId) {
                        dispatch(closeTab(currentTabId))
                        nav.replace(Routes.DISCOVER_SEARCH)
                    }
                },
            },
        ]
    }, [
        isBookMarked,
        LL,
        toggleBookmark,
        isDapp,
        webviewRef,
        navigationState?.title,
        navigationState?.url,
        navToNewTab,
        navToTabsManager,
        currentTabId,
        dispatch,
        nav,
        onClose,
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
                        <BaseTouchable key={action.id} style={styles.actionItemContainer} action={action.onPress}>
                            <BaseIcon
                                name={action.icon}
                                size={16}
                                iconPadding={8}
                                bg={
                                    action.id === "close-tab"
                                        ? theme.colors.actionBottomSheet.dangerIconBackground
                                        : theme.colors.actionBottomSheet.iconBackground
                                }
                                color={
                                    action.id === "close-tab"
                                        ? theme.colors.actionBottomSheet.dangerIcon
                                        : theme.colors.actionBottomSheet.icon
                                }
                            />
                            <BaseText
                                typographyFont="bodySemiBold"
                                color={
                                    action.id === "close-tab"
                                        ? theme.colors.actionBottomSheet.dangerText
                                        : theme.colors.actionBottomSheet.text
                                }>
                                {action.label}
                            </BaseText>
                        </BaseTouchable>
                    ) : (
                        <BaseSpacer
                            key={action.id}
                            height={1}
                            background={theme.colors.actionBottomSheet.iconBackground}
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
