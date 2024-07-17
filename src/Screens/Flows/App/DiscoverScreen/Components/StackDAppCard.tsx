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

    return (
        <Animated.View entering={ZoomIn} exiting={ZoomOut}>
            <BaseTouchable style={[styles.rootContainer, { width: cardDimension }]} onPress={onPress}>
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
                                backgroundColor: theme.colors.card,
                                opacity: 0.5,
                                marginLeft: 4,
                            },
                            styles.icon,
                        ] as StyleProp<ImageStyle>
                    }
                    onError={() => setLoadFallback(true)}
                    resizeMode="contain"
                />
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
    })
