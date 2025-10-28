import { useQuery } from "@tanstack/react-query"
import React, { useCallback, useMemo } from "react"
import { Pressable, StyleSheet } from "react-native"
import FastImage, { ImageStyle } from "react-native-fast-image"
import LinearGradient from "react-native-linear-gradient"
import Animated from "react-native-reanimated"
import { BaseIcon, BaseText, BaseView, BlurView, NFTImageComponent } from "~Components"
import { COLORS } from "~Constants"
import { useNFTMedia, useThemedStyles } from "~Hooks"
import { useNftBookmarking } from "~Hooks/useNftBookmarking"
import { useCollectibleDetails } from "~Hooks/useCollectibleDetails"
import { useFavoriteAnimation } from "~Hooks/useFavoriteAnimation"
import { NFTMediaType } from "~Model"
import HapticsService from "~Services/HapticsService"
import { wrapFunctionComponent } from "~Utils/ReanimatedUtils/Reanimated"
import { NFTPlaceholderDarkV2 } from "~Assets"

type Props = {
    address: string
    tokenId: string
    onPress: (args: { address: string; tokenId: string }) => void
}

const AnimatedBaseIcon = Animated.createAnimatedComponent(wrapFunctionComponent(BaseIcon))

export const CollectibleCard = ({ address, tokenId, onPress }: Props) => {
    const { styles } = useThemedStyles(baseStyles)
    const { isFavorite, toggleFavorite } = useNftBookmarking(address, tokenId)
    const { animatedStyles, favoriteIconAnimation } = useFavoriteAnimation()
    const details = useCollectibleDetails({ address, tokenId })
    const { fetchMedia } = useNFTMedia()

    const { data: media } = useQuery({
        queryKey: ["COLLECTIBLES", "MEDIA", details.image],
        queryFn: () => fetchMedia(details.image!),
        enabled: !!details.image,
        staleTime: 5 * 60 * 1000,
        gcTime: 5 * 60 * 1000,
    })

    const handlePress = useCallback(() => {
        onPress({ address, tokenId })
    }, [address, onPress, tokenId])

    const handleToggleFavorite = useCallback(() => {
        HapticsService.triggerImpact({ level: "Light" })
        favoriteIconAnimation(finished => {
            if (finished) {
                toggleFavorite()
            }
        })
    }, [favoriteIconAnimation, toggleFavorite])

    const RenderMedia = useMemo(() => {
        if (media?.mediaType === NFTMediaType.IMAGE) {
            return <NFTImageComponent style={styles.image as ImageStyle} uri={media.image} />
        }

        return (
            <FastImage
                fallback
                defaultSource={NFTPlaceholderDarkV2}
                style={styles.image as ImageStyle}
                resizeMode={FastImage.resizeMode.cover}
            />
        )
    }, [media?.mediaType, media?.image, styles.image])

    return (
        <Pressable testID={`VBD_COLLECTIBLE_CARD_${address}_${tokenId}`} style={styles.root} onPress={handlePress}>
            <Pressable
                testID={`VBD_COLLECTIBLE_CARD_FAVORITE_${address}_${tokenId}`}
                style={styles.favoriteContainerContainer}
                onPress={handleToggleFavorite}>
                <AnimatedBaseIcon
                    name={isFavorite ? "icon-star-on" : "icon-star"}
                    color={COLORS.WHITE}
                    size={16}
                    style={animatedStyles}
                />
            </Pressable>
            {RenderMedia}

            <BlurView style={styles.bottom} overlayColor="transparent" blurAmount={10}>
                <LinearGradient
                    colors={[COLORS.BALANCE_BACKGROUND_GRADIENT_END_50, COLORS.BALANCE_BACKGROUND_50]}
                    useAngle
                    angle={0}>
                    <BaseView flexDirection="row" alignItems="center" p={8}>
                        <BaseText typographyFont="captionSemiBold" color={COLORS.WHITE_RGBA_90} flexDirection="row">
                            {details.name}
                        </BaseText>
                    </BaseView>
                </LinearGradient>
            </BlurView>
        </Pressable>
    )
}

const baseStyles = () =>
    StyleSheet.create({
        root: {
            borderRadius: 12,
            position: "relative",
            flex: 1,
            overflow: "hidden",
            aspectRatio: 0.8791,
            maxWidth: "50%",
            backgroundColor: COLORS.PURPLE,
        },
        image: {
            height: "100%",
            width: "100%",
        },
        favoriteContainerContainer: {
            position: "absolute",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            padding: 8,
            top: 0,
            right: 0,
            zIndex: 1,
        },
        bottom: { position: "absolute", bottom: 0, left: 0, width: "100%" },
    })
