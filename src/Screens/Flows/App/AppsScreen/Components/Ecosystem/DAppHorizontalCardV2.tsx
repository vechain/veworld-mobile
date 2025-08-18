import React, { useState } from "react"
import { Image, ImageStyle, StyleProp, StyleSheet } from "react-native"
import { BaseIcon, BaseText, BaseTouchable, BaseView } from "~Components"
import { DiscoveryDApp } from "~Constants"
import { useThemedStyles } from "~Hooks"
import { useAppLogo } from "~Hooks/useAppLogo"

type Props = {
    dapp: DiscoveryDApp
    onOpenDApp: (dapp: DiscoveryDApp) => void
    onPress: (dapp: DiscoveryDApp) => void
}

const IMAGE_SIZE = 64

export const DAppHorizontalCardV2 = ({ dapp, onOpenDApp, onPress }: Props) => {
    const [loadFallback, setLoadFallback] = useState(false)

    const { styles, theme } = useThemedStyles(baseStyles)

    const iconUri = useAppLogo({ app: dapp })

    return (
        <BaseView flexDirection="row" justifyContent="space-between" alignItems="center" style={[styles.rootContainer]}>
            {/* Image */}
            <BaseTouchable style={styles.touchableContainer} onPress={() => onOpenDApp(dapp)}>
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
                <BaseView flex={1} justifyContent="center" flexDirection="column" gap={4}>
                    <BaseText typographyFont="bodySemiBold" color={theme.colors.dappCard.name}>
                        {dapp.name}
                    </BaseText>
                    <BaseText
                        typographyFont="captionMedium"
                        numberOfLines={2}
                        color={theme.colors.dappCard.description}>
                        {dapp.desc}
                    </BaseText>
                </BaseView>
            </BaseTouchable>
            {/* Action Btn */}
            <BaseTouchable style={styles.iconContainer} onPress={() => onPress(dapp)}>
                <BaseIcon name="icon-more-vertical" color={theme.colors.dappCard.icon} size={20} />
            </BaseTouchable>
        </BaseView>
    )
}

const baseStyles = () =>
    StyleSheet.create({
        rootContainer: {
            gap: 12,
        },
        touchableContainer: {
            flexDirection: "row",
            alignItems: "center",
            flex: 1,
            gap: 24,
        },
        iconContainer: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            padding: 10,
        },
        icon: {
            borderRadius: 8,
            overflow: "hidden",
        },
    })
