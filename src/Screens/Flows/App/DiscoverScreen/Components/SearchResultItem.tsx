import React, { useCallback, useMemo, useState } from "react"
import { Image, ImageStyle, StyleProp, StyleSheet } from "react-native"
import { BaseIcon, BaseText, BaseTouchable, BaseView } from "~Components"
import { useThemedStyles, useVisitedUrls } from "~Hooks"
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

    const iconUri = useMemo(() => {
        if (item.type === HistoryUrlKind.DAPP && item.dapp.id) return DAppUtils.getAppHubIconUrl(item.dapp.id)
        if (item.type === HistoryUrlKind.DAPP) return generateFaviconUrl(item.dapp.href)
        return generateFaviconUrl(item.url)
    }, [item])

    const { name, description, url } = useMemo(() => {
        switch (item.type) {
            case HistoryUrlKind.DAPP:
                return { name: item.dapp.name, description: item.dapp.desc, url: item.dapp.href }
            case HistoryUrlKind.URL:
                return { name: item.name, description: item.url, url: item.url }
        }
    }, [item])

    const handleClick = useCallback(() => {
        removeVisitedUrl(url)
    }, [removeVisitedUrl, url])

    return (
        <BaseView flexDirection="row" justifyContent="space-between" style={[styles.rootContainer]}>
            {/* Image */}
            <Image
                source={
                    loadFallback
                        ? require("~Assets/Img/dapp-fallback.png")
                        : {
                              uri: iconUri,
                          }
                }
                style={
                    [
                        { height: IMAGE_SIZE, width: IMAGE_SIZE, backgroundColor: theme.colors.card },
                        styles.icon,
                    ] as StyleProp<ImageStyle>
                }
                onError={() => setLoadFallback(true)}
                resizeMode="contain"
            />
            {/* Title & Desc */}
            <BaseView flex={1} justifyContent="center">
                <BaseText typographyFont="bodySemiBold">{name}</BaseText>
                <BaseText typographyFont="caption" numberOfLines={1}>
                    {description}
                </BaseText>
            </BaseView>
            {/* Action Btn */}
            <BaseTouchable onPress={handleClick}>
                <BaseIcon name="icon-x" size={20} />
            </BaseTouchable>
        </BaseView>
    )
}

const baseStyles = () =>
    StyleSheet.create({
        rootContainer: {
            gap: 12,
            alignItems: "center",
        },
        icon: {
            borderRadius: 4,
            overflow: "hidden",
        },
    })
