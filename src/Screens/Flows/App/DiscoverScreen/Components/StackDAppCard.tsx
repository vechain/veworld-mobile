import React, { useState } from "react"
import { Image, ImageStyle, StyleProp, StyleSheet, useWindowDimensions } from "react-native"
import { DiscoveryDApp } from "~Constants"
import { useThemedStyles } from "~Hooks"
import { getAppHubIconUrl } from "../utils"
import Animated, { ZoomIn, ZoomOut } from "react-native-reanimated"
import { BaseSpacer, BaseText, BaseTouchable, BaseView } from "~Components"

type Props = {
    columns: number
    columnsGap: number
    dapp: DiscoveryDApp[]
    onPress: () => void
}

export const StackDAppCard = ({ columns, columnsGap, dapp, onPress }: Props) => {
    const { width: windowWidth } = useWindowDimensions()
    const { styles, theme } = useThemedStyles(baseStyles)
    const [loadFallback, setLoadFallback] = useState(false)

    const gapsNumber = columns + 1
    const cardDimension = (windowWidth - columnsGap * gapsNumber) / columns
    const imageDimension = cardDimension - 16
    const iconUri = dapp[0]?.id
        ? getAppHubIconUrl(dapp[0].id)
        : `${process.env.REACT_APP_GOOGLE_FAVICON_URL}${dapp[0]?.href}`

    const overlayBackground = !theme.isDark ? "#d9d9d9" : "#584E87"

    return (
        <Animated.View entering={ZoomIn} exiting={ZoomOut}>
            <BaseTouchable style={[styles.rootContainer, { width: cardDimension }]} onPress={onPress}>
                <BaseView
                    style={[
                        {
                            height: imageDimension,
                            width: imageDimension,
                            backgroundColor: theme.colors.card,
                        },
                        styles.backgroundimageContainer,
                    ]}>
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
                                {
                                    height: imageDimension,
                                    width: imageDimension,
                                },
                            ] as StyleProp<ImageStyle>
                        }
                        onError={() => setLoadFallback(true)}
                        resizeMode="contain"
                    />
                    <BaseView
                        style={[
                            {
                                backgroundColor: overlayBackground,
                            },
                            styles.overlay,
                        ]}
                    />
                </BaseView>
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
                            {
                                position: "absolute",
                                height: imageDimension,
                                width: imageDimension,
                                backgroundColor: theme.colors.card,
                                top: 8,
                                left: 12,
                            },
                            styles.icon,
                        ] as StyleProp<ImageStyle>
                    }
                    onError={() => setLoadFallback(true)}
                    resizeMode="contain"
                />

                <BaseSpacer height={16} />
                <BaseView alignItems="center">
                    <BaseText numberOfLines={1} fontSize={10} style={styles.text}>
                        {dapp[0]?.name.length > 9 ? dapp[0].name.slice(0, 9) + "..." : dapp[0]?.name}
                    </BaseText>
                </BaseView>
            </BaseTouchable>
        </Animated.View>
    )
}

const baseStyles = () =>
    StyleSheet.create({
        rootContainer: {
            justifyContent: "center",
        },
        icon: {
            borderRadius: 12,
            overflow: "hidden",
        },
        text: {
            width: "100%",
        },
        backgroundimageContainer: {
            borderRadius: 12,
            overflow: "hidden",
            marginLeft: 4,
        },
        overlay: {
            position: "absolute",
            height: "100%",
            width: "100%",
            opacity: 0.7,
        },
    })
