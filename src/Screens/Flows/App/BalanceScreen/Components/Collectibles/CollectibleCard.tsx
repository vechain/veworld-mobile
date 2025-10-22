import { useQuery } from "@tanstack/react-query"
import React, { useCallback, useMemo } from "react"
import { Pressable, StyleSheet } from "react-native"
import { ImageStyle } from "react-native-fast-image"
import LinearGradient from "react-native-linear-gradient"
import { BaseIcon, BaseText, BaseView, BlurView, NFTImageComponent } from "~Components"
import { COLORS } from "~Constants"
import { useNftBookmarking, useNFTMedia, useThemedStyles } from "~Hooks"
import { useCollectibleMetadata } from "~Hooks/useCollectibleMetadata"
import { NFTMediaType } from "~Model"
import HapticsService from "~Services/HapticsService"

type Props = {
    address: string
    tokenId: string
}

export const CollectibleCard = ({ address, tokenId }: Props) => {
    const { styles } = useThemedStyles(baseStyles)
    const { isFavorite, toggleFavorite } = useNftBookmarking(address, tokenId)
    const { data } = useCollectibleMetadata({ address, tokenId })

    const { name } = useMemo(() => {
        return {
            name: data?.name,
        }
    }, [data?.name])

    const { fetchMedia } = useNFTMedia()

    const { data: media } = useQuery({
        queryKey: ["COLLECTIBLES", "MEDIA", data?.image],
        queryFn: () => fetchMedia(data?.image!),
        enabled: !!data?.image,
        staleTime: 5 * 60 * 1000,
        gcTime: 5 * 60 * 1000,
    })

    const handleToggleFavorite = useCallback(() => {
        HapticsService.triggerImpact({ level: "Light" })
        toggleFavorite()
    }, [toggleFavorite])

    return (
        <Pressable style={styles.root}>
            <Pressable onPress={handleToggleFavorite} style={styles.favoriteIconContainer} hitSlop={8}>
                <BaseIcon name={isFavorite ? "icon-star-on" : "icon-star"} color={COLORS.WHITE} />
            </Pressable>
            {media?.mediaType === NFTMediaType.IMAGE && (
                <NFTImageComponent style={styles.image as ImageStyle} uri={media.image} />
            )}

            <BlurView style={styles.bottom} overlayColor="transparent" blurAmount={10}>
                <LinearGradient
                    colors={[COLORS.BALANCE_BACKGROUND_GRADIENT_END_50, COLORS.BALANCE_BACKGROUND_50]}
                    useAngle
                    angle={0}>
                    <BaseView flexDirection="row" alignItems="center" p={8}>
                        <BaseText typographyFont="captionSemiBold" color={COLORS.WHITE_RGBA_90} flexDirection="row">
                            {name}
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
        },
        image: {
            height: "100%",
            width: "100%",
        },
        favoriteIconContainer: {
            top: 8,
            right: 12,
            position: "absolute",
            zIndex: 1,
        },
        bottom: { position: "absolute", bottom: 0, left: 0, width: "100%" },
    })
