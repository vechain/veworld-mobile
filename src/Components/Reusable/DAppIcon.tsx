import React, { useMemo, useState } from "react"
import { StyleSheet } from "react-native"
import FastImage from "react-native-fast-image"
import { BaseIcon, BaseView } from "~Components/Base"
import { useThemedStyles } from "~Hooks"
import { IconKey } from "~Model"

type Props = {
    /**
     * Size of the image
     */
    size: number
    /**
     * URI of the app icon
     */
    iconUri: string | undefined
    /**
     * Fallback icon
     * @default 'icon-globe'
     */
    fallbackIcon?: IconKey
    /**
     * Background color on fallback.
     * @default theme.colors.history.historyItem.iconBackground
     */
    fallbackBg?: string
    /**
     * Icon color on fallback.
     * @default theme.colors.history.historyItem.iconColor
     */
    fallbackIconColor?: string
}

export const DAppIcon = ({
    size,
    iconUri,
    fallbackIcon = "icon-globe",
    fallbackBg: _fallbackBg,
    fallbackIconColor: _fallbackIconColor,
}: Props) => {
    const [loadFallback, setLoadFallback] = useState(false)

    const { styles, theme } = useThemedStyles(baseStyles)

    const fallbackBg = useMemo(
        () => _fallbackBg ?? theme.colors.history.historyItem.iconBackground,
        [_fallbackBg, theme.colors.history.historyItem.iconBackground],
    )
    const fallbackIconColor = useMemo(
        () => _fallbackIconColor ?? theme.colors.history.historyItem.iconColor,
        [_fallbackIconColor, theme.colors.history.historyItem.iconColor],
    )

    return (
        <BaseView
            style={[styles.iconContainer, { width: size, height: size }]}
            bg={loadFallback || !iconUri ? fallbackBg : "transparent"}>
            {loadFallback || !iconUri ? (
                <BaseIcon
                    name={fallbackIcon}
                    //Keep the same aspect ratio as the original design
                    size={(20 / 48) * size}
                    color={fallbackIconColor}
                    testID="DAPP_ICON_FALLBACK_ICON"
                />
            ) : (
                <FastImage
                    source={{
                        uri: iconUri,
                    }}
                    style={[{ width: size, height: size }]}
                    onError={() => setLoadFallback(true)}
                    resizeMode="contain"
                    testID="DAPP_ICON_IMAGE"
                />
            )}
        </BaseView>
    )
}

const baseStyles = () =>
    StyleSheet.create({
        iconContainer: {
            borderRadius: 8,
            overflow: "hidden",
            alignItems: "center",
            justifyContent: "center",
        },
    })
