import React, { MutableRefObject, useCallback, useMemo } from "react"
import { StyleSheet } from "react-native"
import { SwipeableItemImperativeRef } from "react-native-swipeable-item"
import { BaseIcon, BaseText, BaseView, DAppIcon, SwipeableRow } from "~Components"
import { useThemedStyles } from "~Hooks"
import { useDynamicAppLogo } from "~Hooks/useAppLogo"
import { useVisitedUrls } from "~Hooks/useBrowserSearch"
import { useBrowserTab } from "~Hooks/useBrowserTab"
import { DAppUtils } from "~Utils"
import { HistoryItem, HistoryUrlKind } from "~Utils/HistoryUtils"
import { useDAppActions } from "../Hooks"
import { Routes } from "~Navigation"

type Props = {
    item: HistoryItem
    swipeableItemRefs: MutableRefObject<Map<string, SwipeableItemImperativeRef>>
}

const IMAGE_SIZE = 48

export const SearchResultItem = ({ item, swipeableItemRefs }: Props) => {
    const { styles, theme } = useThemedStyles(baseStyles)
    const { onDAppPress } = useDAppActions(Routes.APPS)
    const { navigateWithTab } = useBrowserTab()
    const fetchDynamicAppLogo = useDynamicAppLogo({ size: IMAGE_SIZE })
    const { removeVisitedUrl } = useVisitedUrls()

    const iconUri = useMemo(() => {
        try {
            if (item.type === HistoryUrlKind.DAPP) return fetchDynamicAppLogo({ app: item.dapp })
            return DAppUtils.generateFaviconUrl(item.url)
        } catch {
            return undefined
        }
    }, [fetchDynamicAppLogo, item])

    const websiteUrl = useMemo(() => {
        switch (item.type) {
            case HistoryUrlKind.DAPP:
                return item.dapp.href
            case HistoryUrlKind.URL:
                return item.url
        }
    }, [item])

    const { name, description, url } = useMemo(() => {
        switch (item.type) {
            case HistoryUrlKind.DAPP:
                return { name: item.dapp.name, description: new URL(item.dapp.href).hostname, url: item.dapp.href }
            case HistoryUrlKind.URL:
                return { name: item.name, description: new URL(item.url).hostname, url: item.url }
        }
    }, [item])

    const handleNavigate = useCallback(() => {
        if (item.type === HistoryUrlKind.DAPP) onDAppPress(item.dapp)
        else navigateWithTab({ url: websiteUrl, title: websiteUrl })
    }, [item, onDAppPress, navigateWithTab, websiteUrl])

    const handleRemoveClick = useCallback(() => {
        removeVisitedUrl(url)
    }, [removeVisitedUrl, url])

    return (
        <BaseView flexDirection="row" style={[styles.rootContainer]}>
            <SwipeableRow
                testID="SEARCH_RESULT_ITEM_CONTAINER"
                xMargins={0}
                yMargins={0}
                item={item}
                itemKey={url}
                snapPointsLeft={[50]}
                handleTrashIconPress={handleRemoveClick}
                swipeableItemRefs={swipeableItemRefs}
                onPress={handleNavigate}>
                <BaseView style={styles.touchableContainer}>
                    <DAppIcon
                        size={IMAGE_SIZE}
                        uri={iconUri}
                        fallbackTestID="SEARCH_RESULT_ITEM_FALLBACK_ICON"
                        imageTestID="SEARCH_RESULT_ITEM_IMAGE"
                    />

                    {/* Title & Desc */}
                    <BaseView flex={1} justifyContent="center">
                        <BaseText
                            typographyFont="bodySemiBold"
                            testID="SEARCH_RESULT_ITEM_NAME"
                            color={theme.colors.history.historyItem.title}>
                            {name}
                        </BaseText>
                        <BaseText
                            typographyFont="captionMedium"
                            numberOfLines={1}
                            testID="SEARCH_RESULT_ITEM_DESCRIPTION"
                            color={theme.colors.history.historyItem.subtitle}>
                            {description}
                        </BaseText>
                    </BaseView>
                    <BaseIcon
                        name={"icon-arrow-link"}
                        size={20}
                        color={theme.colors.history.historyItem.rightIconColor}
                    />
                </BaseView>
            </SwipeableRow>
        </BaseView>
    )
}

const baseStyles = () =>
    StyleSheet.create({
        rootContainer: {
            gap: 12,
            alignItems: "center",
        },
        touchableContainer: {
            gap: 24,
            alignItems: "center",
            flexDirection: "row",
            flexShrink: 1,
            paddingRight: 10,
        },
        icon: {
            borderRadius: 8,
            overflow: "hidden",
        },
        dappImage: {
            width: IMAGE_SIZE,
            height: IMAGE_SIZE,
        },
        iconContainer: {
            borderRadius: 8,
            overflow: "hidden",
            alignItems: "center",
            justifyContent: "center",
            width: IMAGE_SIZE,
            height: IMAGE_SIZE,
        },
    })
