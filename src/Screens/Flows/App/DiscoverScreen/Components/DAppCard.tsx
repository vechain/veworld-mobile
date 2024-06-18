import React, { useState } from "react"
import { Image, ImageStyle, StyleProp, StyleSheet, useWindowDimensions } from "react-native"
import { DiscoveryDApp } from "~Constants"
import { BaseSpacer, BaseText, BaseTouchable } from "~Components"
import { getAppHubIconUrl } from "../utils"
import Animated, { ZoomIn, ZoomOut } from "react-native-reanimated"
import { useThemedStyles } from "~Hooks"

type DAppCardProps = {
    columns: number
    columnsGap: number
    dapp: DiscoveryDApp
    onPress: () => void
}

export const DAppCard = ({ columns, columnsGap, dapp, onPress }: DAppCardProps) => {
    const { width: windowWidth } = useWindowDimensions()
    const { styles, theme } = useThemedStyles(baseStyles)
    const [loadFallback, setLoadFallback] = useState(false)

    const gapsNumber = columns + 1
    const iconDimension = (windowWidth - columnsGap * gapsNumber) / columns
    const iconUri = dapp.id ? getAppHubIconUrl(dapp.id) : `${process.env.REACT_APP_GOOGLE_FAVICON_URL}${dapp.href}`

    return (
        <Animated.View entering={ZoomIn} exiting={ZoomOut}>
            <BaseTouchable style={[styles.rootContainer, { maxWidth: iconDimension }]} onPress={onPress}>
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
                            { height: iconDimension, width: iconDimension, backgroundColor: theme.colors.card },
                            styles.icon,
                        ] as StyleProp<ImageStyle>
                    }
                    onError={() => setLoadFallback(true)}
                    resizeMode="cover"
                />
                <BaseSpacer height={8} />
                <BaseText ellipsizeMode="tail" numberOfLines={1} fontSize={10}>
                    {dapp.name}
                </BaseText>
            </BaseTouchable>
        </Animated.View>
    )
}

const baseStyles = () =>
    StyleSheet.create({
        rootContainer: {
            justifyContent: "center",
            alignItems: "center",
        },
        icon: {
            borderRadius: 12,
            overflow: "hidden",
        },
    })
