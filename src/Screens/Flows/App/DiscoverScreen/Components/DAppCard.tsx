import React, { useState } from "react"
import { Image, ImageStyle, StyleProp, StyleSheet } from "react-native"
import Animated, { ZoomIn, ZoomOut } from "react-native-reanimated"
import { BaseSpacer, BaseText, BaseTouchable } from "~Components"
import { DiscoveryDApp } from "~Constants"
import { useThemedStyles } from "~Hooks"
import { DAppUtils } from "~Utils"
import { useDAppTags } from "../Hooks/useDAppTags"

type DAppCardProps = {
    dapp: DiscoveryDApp
    onPress: () => void
}

export const DAppCard = ({ dapp, onPress }: DAppCardProps) => {
    const { styles, theme } = useThemedStyles(baseStyles)
    const [loadFallback, setLoadFallback] = useState(false)

    const { getTag } = useDAppTags({ dapp })

    const cardDimension = 96
    const imageDimension = 96
    const iconUri = dapp.id
        ? DAppUtils.getAppHubIconUrl(dapp.id)
        : `${process.env.REACT_APP_GOOGLE_FAVICON_URL}${dapp.href}`

    return (
        <Animated.View entering={ZoomIn} exiting={ZoomOut}>
            <BaseTouchable
                style={[styles.rootContainer, { width: cardDimension }]}
                onPress={onPress}
                // Workaround -> https://github.com/mpiannucci/react-native-context-menu-view/issues/60#issuecomment-1453864955
                onLongPress={() => {}}>
                <BaseSpacer height={8} />
                <Image
                    source={
                        loadFallback
                            ? require("~Assets/Img/dapp-fallback.png")
                            : {
                                  uri: iconUri,
                              }
                    }
                    style={[{ height: imageDimension, width: imageDimension }, styles.icon] as StyleProp<ImageStyle>}
                    onError={() => setLoadFallback(true)}
                    resizeMode="contain"
                />
                <BaseSpacer height={8} />
                <BaseText numberOfLines={1} typographyFont="bodySemiBold" style={styles.text}>
                    {dapp.name.length > 9 ? dapp.name.slice(0, 9) + "..." : dapp.name}
                </BaseText>
                <BaseText
                    numberOfLines={1}
                    typographyFont="captionMedium"
                    color={theme.colors.subtitle}
                    style={styles.tag}>
                    {getTag()}
                </BaseText>
            </BaseTouchable>
        </Animated.View>
    )
}

const baseStyles = () =>
    StyleSheet.create({
        rootContainer: {
            justifyContent: "center",
            alignItems: "flex-start",
        },
        icon: {
            borderRadius: 8,
            overflow: "hidden",
        },
        text: {
            width: "100%",
        },
        tag: {
            textTransform: "capitalize",
        },
    })
