import { useQuery } from "@tanstack/react-query"
import React, { useCallback, useMemo } from "react"
import { Pressable, StyleSheet } from "react-native"
import FastImage, { ImageStyle } from "react-native-fast-image"
import LinearGradient from "react-native-linear-gradient"
import Animated from "react-native-reanimated"
import { NFTPlaceholderDarkV2 } from "~Assets"
import { BaseIcon, BaseText, BaseView, BlurView, NFTImageComponent } from "~Components"
import { COLORS } from "~Constants"
import { useNFTMedia, useThemedStyles } from "~Hooks"
import { useBlacklistedCollection } from "~Hooks/useBlacklistedCollection"
import { useCollectibleDetails } from "~Hooks/useCollectibleDetails"
import { useFavoriteAnimation } from "~Hooks/useFavoriteAnimation"
import { useNftBookmarking } from "~Hooks/useNftBookmarking"
import { NFTMediaType } from "~Model"
import HapticsService from "~Services/HapticsService"
import { wrapFunctionComponent } from "~Utils/ReanimatedUtils/Reanimated"

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
    const { isBlacklisted } = useBlacklistedCollection(address)
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
            {!isBlacklisted && (
                <BaseView style={styles.favoriteRootContainer}>
                    <LinearGradient
                        colors={["rgba(29, 23, 58, 0.9)", "rgba(29, 23, 58, 0.65)", "rgba(29, 23, 58, 0)"]}
                        useAngle
                        locations={[0, 0.5, 1]}
                        style={styles.favoriteContainer}
                        angle={180}>
                        <Pressable
                            testID={`VBD_COLLECTIBLE_CARD_FAVORITE_${address}_${tokenId}`}
                            style={styles.favoriteIcon}
                            onPress={handleToggleFavorite}>
                            <AnimatedBaseIcon
                                name={isFavorite ? "icon-star-on" : "icon-star"}
                                color={COLORS.WHITE}
                                size={16}
                                style={animatedStyles}
                            />
                        </Pressable>
                    </LinearGradient>
                </BaseView>
            )}

            {RenderMedia}
            {isBlacklisted && <BlurView style={[StyleSheet.absoluteFill]} overlayColor="transparent" blurAmount={20} />}

            <BlurView style={styles.bottom} overlayColor="transparent" blurAmount={10}>
                <LinearGradient
                    colors={[COLORS.BALANCE_BACKGROUND_GRADIENT_END_50, COLORS.BALANCE_BACKGROUND_50]}
                    useAngle
                    angle={0}>
                    <BaseView flexDirection="row" alignItems="center" p={8}>
                        <BaseText
                            typographyFont="captionSemiBold"
                            color={COLORS.WHITE_RGBA_90}
                            flexDirection="row"
                            flex={1}
                            numberOfLines={1}>
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
        favoriteRootContainer: {
            width: "100%",
            position: "absolute",
            top: 0,
            right: 0,
            zIndex: 1,
        },
        favoriteContainer: {
            width: "100%",
            padding: 8,
            flexDirection: "row",
            justifyContent: "flex-end",
            alignItems: "center",
        },
        favoriteIcon: {
            marginRight: 4,
        },
        bottom: { position: "absolute", bottom: 0, left: 0, width: "100%" },
    })
