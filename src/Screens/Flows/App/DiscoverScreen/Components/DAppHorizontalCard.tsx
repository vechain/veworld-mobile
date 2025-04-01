import React, { useState } from "react"
import { Image, ImageStyle, StyleProp, StyleSheet } from "react-native"
import { BaseIcon, BaseText, BaseTouchable, BaseView } from "~Components"
import { DiscoveryDApp } from "~Constants"
import { useThemedStyles } from "~Hooks"
import { DAppUtils } from "~Utils"

type Props = {
    dapp: DiscoveryDApp
    onPress: (dapp: DiscoveryDApp) => void
}

const IMAGE_SIZE = 48

export const DAppHorizontalCard = ({ dapp, onPress }: Props) => {
    const [loadFallback, setLoadFallback] = useState(false)

    const { styles, theme } = useThemedStyles(baseStyles)

    const iconUri = dapp.id
        ? DAppUtils.getAppHubIconUrl(dapp.id)
        : `${process.env.REACT_APP_GOOGLE_FAVICON_URL}${dapp.href}`

    return (
        <BaseView flexDirection="row" justifyContent="space-between" alignItems="center" style={[styles.rootContainer]}>
            {/* Image */}
            <Image
                source={
                    loadFallback
                        ? require("~Assets/Img/dapp-fallback.png")
                        : {
                              uri: iconUri,
                          }
                }
                style={[{ height: IMAGE_SIZE, width: IMAGE_SIZE }, styles.icon] as StyleProp<ImageStyle>}
                onError={() => setLoadFallback(true)}
                resizeMode="contain"
            />
            {/* Title & Desc */}
            <BaseView flex={1} justifyContent="center">
                <BaseText typographyFont="bodySemiBold">{dapp.name}</BaseText>
                <BaseText typographyFont="caption" numberOfLines={1}>
                    {dapp.desc}
                </BaseText>
            </BaseView>
            {/* Action Btn */}
            <BaseTouchable style={[styles.touchableArea]} onPress={() => onPress(dapp)}>
                <BaseIcon name="icon-more-vertical" color={theme.colors.text} size={20} />
            </BaseTouchable>
        </BaseView>
    )
}

const baseStyles = () =>
    StyleSheet.create({
        rootContainer: {
            gap: 12,
        },
        icon: {
            borderRadius: 4,
            overflow: "hidden",
        },
        touchableArea: { flexDirection: "row", alignItems: "center", justifyContent: "center", width: 40, height: 40 },
    })
