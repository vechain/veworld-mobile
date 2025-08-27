import React, { useCallback, useMemo, useState } from "react"
import { Image, ImageStyle, StyleProp, StyleSheet, TouchableOpacity } from "react-native"
import { BaseIcon, BaseText, BaseView } from "~Components"
import { useThemedStyles } from "~Hooks"
import { useDynamicAppLogo } from "~Hooks/useAppLogo"
import { useBrowserTab } from "~Hooks/useBrowserTab"
import { DAppUtils } from "~Utils"
import { HistoryItem, HistoryUrlKind } from "~Utils/HistoryUtils"
import { useDAppActions } from "../Hooks"

type Props = {
    item: HistoryItem
}

const IMAGE_SIZE = 48

export const SearchResultItem = ({ item }: Props) => {
    const [loadFallback, setLoadFallback] = useState(false)
    const { styles, theme } = useThemedStyles(baseStyles)
    const { onDAppPress } = useDAppActions()
    const { navigateWithTab } = useBrowserTab()
    const fetchDynamicAppLogo = useDynamicAppLogo({ size: IMAGE_SIZE })

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

    const { name, description } = useMemo(() => {
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

    return (
        <BaseView flexDirection="row" style={[styles.rootContainer]}>
            <TouchableOpacity
                style={styles.touchableContainer}
                onPress={handleNavigate}
                testID="SEARCH_RESULT_ITEM_CONTAINER">
                <BaseView
                    style={styles.iconContainer}
                    bg={loadFallback || !iconUri ? theme.colors.history.historyItem.iconBackground : "transparent"}>
                    {loadFallback || !iconUri ? (
                        <BaseIcon
                            name={item.type === HistoryUrlKind.DAPP ? "icon-image" : "icon-globe"}
                            size={20}
                            color={theme.colors.history.historyItem.iconColor}
                            testID="SEARCH_RESULT_ITEM_FALLBACK_ICON"
                        />
                    ) : (
                        <Image
                            source={{
                                uri: iconUri,
                            }}
                            style={styles.dappImage as StyleProp<ImageStyle>}
                            onError={() => setLoadFallback(true)}
                            resizeMode="contain"
                            testID="SEARCH_RESULT_ITEM_IMAGE"
                        />
                    )}
                </BaseView>

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
                <BaseIcon name={"icon-arrow-link"} size={20} color={theme.colors.history.historyItem.rightIconColor} />
            </TouchableOpacity>
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
