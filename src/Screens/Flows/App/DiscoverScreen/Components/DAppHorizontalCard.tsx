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
        <BaseTouchable onPress={() => onPress(dapp)}>
            <BaseView
                flexDirection="row"
                justifyContent="space-between"
                alignItems="center"
                style={[styles.rootContainer]}>
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
                <BaseView style={[styles.iconContainer]}>
                    <BaseIcon name="icon-more-vertical" color={theme.colors.text} size={20} />
                </BaseView>
            </BaseView>
        </BaseTouchable>
    )
}

const baseStyles = () =>
    StyleSheet.create({
        rootContainer: {
            gap: 12,
        },
        iconContainer: { flexDirection: "row", alignItems: "center", justifyContent: "center" },
        icon: {
            borderRadius: 4,
            overflow: "hidden",
        },
    })
