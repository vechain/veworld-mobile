import React, { useMemo, useState } from "react"
import { StyleSheet } from "react-native"
import FastImage, { Source } from "react-native-fast-image"
import { BaseIcon, BaseView } from "~Components/Base"
import { useThemedStyles } from "~Hooks"
import { IconKey } from "~Model"
import { URIUtils } from "~Utils"

export type DappIconSize = 16 | 24 | 32 | 48 | 64 | 72 | 88

type Props = {
    /**
     * Size of the image.
     * @default 48
     */
    size?: DappIconSize
    /**
     * URI of the app. Use `useAppLogo` or `useDynamicAppLogo` to get it
     */
    uri: string | undefined
    /**
     * testID for the fallback icon
     * @default DAPP_LOGO_FALLBACK_ICON
     */
    fallbackTestID?: string
    /**
     * testID for the image
     * @default DAPP_LOGO_IMAGE
     */
    imageTestID?: string
    /**
     * Background color for the fallback icon
     * @default theme.colors.history.historyItem.iconBackground
     */
    fallbackBg?: string
    /**
     * Icon color for the fallback icon
     * @default theme.colors.history.historyItem.iconColor
     */
    fallbackIconColor?: string
    /**
     * Fallback icon
     * @default icon-image
     */
    fallbackIcon?: IconKey
    /**
     * Caching strategy for the logo.
     * @default FastImage.cacheControl.web
     */
    cachingStrategy?: Source["cache"]
}

const sizeDetails: Record<DappIconSize, { borderRadius: number; fallbackIconSize: number }> = {
    "16": {
        borderRadius: 2,
        fallbackIconSize: 8,
    },
    "24": {
        borderRadius: 4,
        fallbackIconSize: 12,
    },
    "32": {
        borderRadius: 4,
        fallbackIconSize: 16,
    },
    "48": {
        borderRadius: 8,
        fallbackIconSize: 20,
    },
    "64": {
        borderRadius: 8,
        fallbackIconSize: 24,
    },
    "72": {
        borderRadius: 8,
        fallbackIconSize: 24,
    },
    "88": {
        borderRadius: 8,
        fallbackIconSize: 32,
    },
}

export const DAppIcon = ({
    size = 48,
    uri,
    fallbackBg: _fallbackBg,
    fallbackIconColor: _fallbackIconColor,
    fallbackIcon = "icon-globe",
    imageTestID = "DAPP_LOGO_IMAGE",
    fallbackTestID = "DAPP_LOGO_FALLBACK_ICON",
    cachingStrategy,
}: Props) => {
    const [loadFallback, setLoadFallback] = useState(false)
    const { styles, theme } = useThemedStyles(baseStyles)

    const fallbackBg = useMemo(
        () => _fallbackBg ?? theme.colors.history.historyItem.iconBackground,
        [_fallbackBg, theme.colors.history.historyItem.iconBackground],
    )

    const cache = useMemo(() => {
        if (cachingStrategy) return cachingStrategy
        if (!uri) return FastImage.cacheControl.web
        if (uri.startsWith(URIUtils.IPFS_GATEWAY)) return FastImage.cacheControl.immutable
        return FastImage.cacheControl.web
    }, [cachingStrategy, uri])

    return (
        <BaseView
            style={[styles.iconContainer, { width: size, height: size, borderRadius: sizeDetails[size].borderRadius }]}
            bg={loadFallback || !uri ? fallbackBg : "transparent"}>
            {loadFallback || !uri ? (
                <BaseIcon
                    name={fallbackIcon}
                    size={sizeDetails[size].fallbackIconSize}
                    color={theme.colors.history.historyItem.iconColor}
                    testID={fallbackTestID}
                />
            ) : (
                <FastImage
                    source={{
                        uri: uri,
                        cache,
                    }}
                    style={{ width: size, height: size }}
                    onError={() => setLoadFallback(true)}
                    resizeMode="contain"
                    testID={imageTestID}
                />
            )}
        </BaseView>
    )
}

const baseStyles = () =>
    StyleSheet.create({
        icon: {
            borderRadius: 8,
            overflow: "hidden",
        },
        iconContainer: {
            overflow: "hidden",
            alignItems: "center",
            justifyContent: "center",
        },
    })
