import { useNavigation } from "@react-navigation/native"
import React, { useCallback, useMemo, useState } from "react"
import { Image, ImageStyle, StyleProp, StyleSheet, TouchableOpacity } from "react-native"
import { BaseIcon, BaseText, BaseTouchable, BaseView } from "~Components"
import { ColorThemeType } from "~Constants"
import { useThemedStyles, useVisitedUrls } from "~Hooks"
import { Routes } from "~Navigation"
import { DAppUtils } from "~Utils"
import { HistoryItem, HistoryUrlKind } from "~Utils/HistoryUtils"

type Props = {
    item: HistoryItem
}

const IMAGE_SIZE = 48

const generateFaviconUrl = (url: string) => {
    const fullUrl = `${process.env.REACT_APP_GOOGLE_FAVICON_URL}${url}`
    const generatedUrl = new URL(fullUrl)
    generatedUrl.searchParams.set("size", "48")
    return generatedUrl.href
}

export const SearchResultItem = ({ item }: Props) => {
    const [loadFallback, setLoadFallback] = useState(false)
    const { removeVisitedUrl } = useVisitedUrls()
    const { styles, theme } = useThemedStyles(baseStyles)
    const nav = useNavigation()

    const iconUri = useMemo(() => {
        if (item.type === HistoryUrlKind.DAPP && item.dapp.id) return DAppUtils.getAppHubIconUrl(item.dapp.id)
        if (item.type === HistoryUrlKind.DAPP) return generateFaviconUrl(item.dapp.href)
        return generateFaviconUrl(item.url)
    }, [item])

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
                return { name: item.dapp.name, description: item.dapp.desc, url: item.dapp.href }
            case HistoryUrlKind.URL:
                return { name: item.name, description: item.url, url: item.url }
        }
    }, [item])

    const handleRemoveClick = useCallback(() => {
        removeVisitedUrl(url)
    }, [removeVisitedUrl, url])

    const handleNavigate = useCallback(() => {
        nav.navigate(Routes.BROWSER, {
            url: websiteUrl,
        })
    }, [websiteUrl, nav])

    return (
        <BaseView flexDirection="row" style={[styles.rootContainer]}>
            <TouchableOpacity style={styles.touchableContainer} onPress={handleNavigate}>
                <BaseView style={styles.iconContainer}>
                    {loadFallback ? (
                        <BaseIcon
                            name={item.type === HistoryUrlKind.DAPP ? "icon-image" : "icon-globe"}
                            size={16}
                            color={theme.colors.emptyStateIcon.foreground}
                        />
                    ) : (
                        <Image
                            source={{
                                uri: iconUri,
                            }}
                            style={styles.dappImage as StyleProp<ImageStyle>}
                            onError={() => setLoadFallback(true)}
                            resizeMode="contain"
                        />
                    )}
                </BaseView>

                {/* Title & Desc */}
                <BaseView flex={1} justifyContent="center">
                    <BaseText typographyFont="bodySemiBold">{name}</BaseText>
                    <BaseText typographyFont="caption" numberOfLines={1}>
                        {description}
                    </BaseText>
                </BaseView>
            </TouchableOpacity>

            {/* Action Btn */}
            <BaseTouchable onPress={handleRemoveClick}>
                <BaseIcon name="icon-x" size={20} />
            </BaseTouchable>
        </BaseView>
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        rootContainer: {
            gap: 12,
            alignItems: "center",
        },
        touchableContainer: {
            gap: 16,
            alignItems: "center",
            flexDirection: "row",
            flexShrink: 1,
        },
        icon: {
            borderRadius: 4,
            overflow: "hidden",
        },
        dappImage: {
            width: IMAGE_SIZE,
            height: IMAGE_SIZE,
        },
        iconContainer: {
            borderRadius: 4,
            overflow: "hidden",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: theme.colors.card,
            width: IMAGE_SIZE,
            height: IMAGE_SIZE,
        },
    })
