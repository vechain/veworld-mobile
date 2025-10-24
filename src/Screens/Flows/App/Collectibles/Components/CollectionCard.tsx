import { useQuery } from "@tanstack/react-query"
import React, { useCallback } from "react"
import { StyleSheet, TouchableOpacity } from "react-native"
import FastImage from "react-native-fast-image"
import Animated from "react-native-reanimated"
import { NFTPlaceholderDark } from "~Assets"
import { BaseIcon, BaseText, BaseView, BlurView } from "~Components"
import { FastImageBackground } from "~Components/Reusable/FastImageBackground"
import { COLORS } from "~Constants"
import { useNFTMedia, useThemedStyles } from "~Hooks"
import { useCollectionsBookmarking } from "~Hooks/useCollectionsBookmarking"
import { useFavoriteAnimation } from "~Hooks/useFavoriteAnimation"
import HapticsService from "~Services/HapticsService"
import { wrapFunctionComponent } from "~Utils/ReanimatedUtils/Reanimated"
import { useCollectionMetadata } from "../Hooks/useCollectionMetadata"

type Props = {
    collectionAddress: string
    onPress: (address: string) => void
    onToggleFavorite: (isFavorite: boolean) => void
}

const AnimatedBaseIcon = Animated.createAnimatedComponent(wrapFunctionComponent(BaseIcon))

export const CollectionCard = ({ collectionAddress, onPress, onToggleFavorite }: Props) => {
    const { styles } = useThemedStyles(baseStyles)
    const { data: collectionMetadata, isLoading } = useCollectionMetadata(collectionAddress)
    const { fetchMedia } = useNFTMedia()
    const { animatedStyles, favoriteIconAnimation } = useFavoriteAnimation()
    const { isFavorite, toggleFavoriteCollection } = useCollectionsBookmarking(collectionAddress)

    const { data: media } = useQuery({
        queryKey: ["COLLECTIBLES", "COLLECTION", "MEDIA", collectionMetadata?.image],
        queryFn: () => fetchMedia(collectionMetadata?.image!),
        enabled: !!collectionMetadata?.image,
        staleTime: 5 * 60 * 60 * 1000,
        gcTime: 24 * 60 * 60 * 1000,
    })

    const handleToggleFavorite = useCallback(() => {
        HapticsService.triggerImpact({ level: "Light" })
        favoriteIconAnimation()
        toggleFavoriteCollection()
        onToggleFavorite(!isFavorite)
    }, [favoriteIconAnimation, toggleFavoriteCollection, onToggleFavorite, isFavorite])

    return (
        <TouchableOpacity disabled={isLoading} activeOpacity={0.8} onPress={() => onPress(collectionAddress)}>
            <BaseView style={styles.card}>
                <FastImageBackground
                    source={{ uri: media?.image, cache: FastImage.cacheControl.immutable }}
                    resizeMode="cover"
                    style={styles.image}
                    fallback
                    defaultSource={NFTPlaceholderDark}>
                    <TouchableOpacity
                        disabled={!collectionMetadata?.id}
                        style={styles.favoriteIconContainer}
                        onPress={handleToggleFavorite}>
                        <AnimatedBaseIcon
                            //TODO: Replace with favoriteCollections
                            name={isFavorite ? "icon-star-on" : "icon-star"}
                            size={16}
                            color={COLORS.WHITE}
                            style={animatedStyles}
                        />
                    </TouchableOpacity>

                    <BlurView style={styles.bottom} overlayColor="transparent" blurAmount={10}>
                        <BaseView
                            flexDirection="row"
                            alignItems="center"
                            justifyContent="space-between"
                            p={8}
                            bg={COLORS.BLACK_RGBA_30}>
                            <BaseText typographyFont="captionSemiBold" color={COLORS.WHITE_RGBA_90} flexDirection="row">
                                {collectionMetadata?.name}
                            </BaseText>
                            {collectionMetadata?.balanceOf && (
                                <BaseView px={8} py={4} bg={COLORS.WHITE_RGBA_15} borderRadius={99}>
                                    <BaseText typographyFont="smallCaptionMedium" color={COLORS.WHITE_RGBA_90}>
                                        {collectionMetadata?.balanceOf}
                                    </BaseText>
                                </BaseView>
                            )}
                        </BaseView>
                    </BlurView>
                </FastImageBackground>
            </BaseView>
        </TouchableOpacity>
    )
}

const baseStyles = () =>
    StyleSheet.create({
        card: {
            width: "100%",
            height: 182,
            borderRadius: 12,
            overflow: "hidden",
            backgroundColor: COLORS.PURPLE,
            position: "relative",
        },
        image: {
            width: "100%",
            height: "100%",
            position: "relative",
        },
        bottom: { position: "absolute", bottom: 0, left: 0, width: "100%" },
        favoriteIconContainer: {
            top: 0,
            right: 0,
            padding: 8,
            position: "absolute",
            zIndex: 1,
        },
        imageErrorContainer: {
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
        },
    })
