import React, { useState } from "react"
import { Image, ImageStyle, StyleProp, StyleSheet } from "react-native"
import Animated, { ZoomIn, ZoomOut } from "react-native-reanimated"
import { BaseText, BaseTouchable } from "~Components"
import { COLORS, DiscoveryDApp, SCREEN_WIDTH } from "~Constants"
import { useThemedStyles } from "~Hooks"
import { useAppLogo } from "~Hooks/useAppLogo"

type DAppCardProps = {
    dapp: DiscoveryDApp
    showDappTitle: boolean
    onPress: () => void
}

export const DAppCard = ({ dapp, onPress, showDappTitle = true }: DAppCardProps) => {
    const { styles, theme } = useThemedStyles(baseStyles)
    const [loadFallback, setLoadFallback] = useState(false)

    const cardDimension = Math.min(SCREEN_WIDTH * 0.2, 72)
    const imageDimension = Math.min(SCREEN_WIDTH * 0.2, 72)
    const textColor = theme.isDark ? COLORS.WHITE : COLORS.GREY_800

    const iconUri = useAppLogo({ app: dapp })

    return (
        <Animated.View entering={ZoomIn} exiting={ZoomOut}>
            <BaseTouchable
                testID={`dapp-card-${dapp.id}`}
                style={[styles.rootContainer, { width: cardDimension }]}
                onPress={onPress}
                // Workaround -> https://github.com/mpiannucci/react-native-context-menu-view/issues/60#issuecomment-1453864955
                onLongPress={() => {}}>
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
                {showDappTitle ?? (
                    <BaseText numberOfLines={1} typographyFont="bodyMedium" color={textColor}>
                        {dapp.name}
                    </BaseText>
                )}
            </BaseTouchable>
        </Animated.View>
    )
}

const baseStyles = () =>
    StyleSheet.create({
        rootContainer: {
            justifyContent: "center",
            flexDirection: "column",
            gap: 12,
        },
        icon: {
            borderRadius: 8,
            overflow: "hidden",
        },
        tag: {
            textTransform: "capitalize",
        },
    })
