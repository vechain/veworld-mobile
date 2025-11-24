import { useQuery } from "@tanstack/react-query"
import moment from "moment"
import React, { useCallback, useMemo } from "react"
import { StyleSheet, TouchableOpacity } from "react-native"
import FastImage from "react-native-fast-image"
import LinearGradient from "react-native-linear-gradient"
import Animated from "react-native-reanimated"
import { NFTPlaceholderDarkV2 } from "~Assets"
import { BaseIcon, BaseText, BaseView, BlurView } from "~Components"
import { FastImageBackground } from "~Components/Reusable/FastImageBackground"
import { COLORS } from "~Constants"
import { useNFTMedia, useThemedStyles } from "~Hooks"
import { useBlacklistedCollection } from "~Hooks/useBlacklistedCollection"
import { useCollectionsBookmarking } from "~Hooks/useCollectionsBookmarking"
import { useCollectionTransferDetails } from "~Hooks/useCollectionTransferDetails"
import { useFavoriteAnimation } from "~Hooks/useFavoriteAnimation"
import { useI18nContext } from "~i18n"
import HapticsService from "~Services/HapticsService"
import AddressUtils from "~Utils/AddressUtils"
import { wrapFunctionComponent } from "~Utils/ReanimatedUtils/Reanimated"
import { useCollectionMetadata } from "../Hooks/useCollectionMetadata"
import { SkeletonCollectionCard } from "./SkeletonCollectionCard"

type Props = {
    collectionAddress: string
    onPress: (address: string) => void
    onToggleFavorite: (isFavorite: boolean) => void
}

const AnimatedBaseIcon = Animated.createAnimatedComponent(wrapFunctionComponent(BaseIcon))

export const CollectionCard = ({ collectionAddress, onPress, onToggleFavorite }: Props) => {
    const { LL } = useI18nContext()
    const { styles } = useThemedStyles(baseStyles)
    const { data: collectionMetadata, isLoading } = useCollectionMetadata(collectionAddress)
    const { fetchMedia } = useNFTMedia()
    const { animatedStyles, favoriteIconAnimation } = useFavoriteAnimation()
    const { isFavorite, toggleFavoriteCollection } = useCollectionsBookmarking(collectionAddress)
    const { isBlacklisted } = useBlacklistedCollection(collectionAddress)
    const { data: transferDetails } = useCollectionTransferDetails({ address: collectionAddress })

    const { data: media } = useQuery({
        queryKey: ["COLLECTIBLES", "MEDIA", collectionMetadata?.image],
        queryFn: () => fetchMedia(collectionMetadata?.image!),
        enabled: !!collectionMetadata?.image,
        staleTime: 5 * 60 * 60 * 1000,
    })

    const handleToggleFavorite = useCallback(() => {
        HapticsService.triggerImpact({ level: "Light" })
        favoriteIconAnimation(finished => {
            if (finished) {
                toggleFavoriteCollection()
                onToggleFavorite(!isFavorite)
            }
        })
    }, [favoriteIconAnimation, toggleFavoriteCollection, onToggleFavorite, isFavorite])

    const isNew = useMemo(() => {
        if (!transferDetails || transferDetails.error) return false
        return moment().diff((transferDetails.data?.data[0].blockTimestamp ?? 0) * 1000, "days") <= 5
    }, [transferDetails])

    const topStyle = useMemo(() => {
        if (isNew && !isBlacklisted) return styles.favoriteContainerBetween
        if (isNew && isBlacklisted) return styles.favoriteContainerLeft
        if (!isNew && !isBlacklisted) return styles.favoriteContainerRight
        return undefined
    }, [
        isBlacklisted,
        isNew,
        styles.favoriteContainerBetween,
        styles.favoriteContainerLeft,
        styles.favoriteContainerRight,
    ])

    if (isLoading) {
        return <SkeletonCollectionCard />
    }

    return (
        <TouchableOpacity
            testID={`VBD_COLLECTION_CARD_${collectionAddress}`}
            disabled={isLoading}
            activeOpacity={0.8}
            onPress={() => onPress(collectionAddress)}
            style={styles.card}>
            <FastImageBackground
                source={{ uri: media?.image, cache: FastImage.cacheControl.immutable }}
                resizeMode="cover"
                style={styles.image}
                fallback
                defaultSource={NFTPlaceholderDarkV2}
                blurred={isBlacklisted}>
                <BaseView style={styles.favoriteRootContainer}>
                    <LinearGradient
                        colors={["rgba(29, 23, 58, 0.9)", "rgba(29, 23, 58, 0.65)", "rgba(29, 23, 58, 0)"]}
                        useAngle
                        locations={[0, 0.5, 1]}
                        style={[styles.favoriteContainer, topStyle]}
                        angle={180}>
                        {isNew && (
                            <BaseText
                                bg="rgba(48, 38, 95, 0.90)"
                                color={COLORS.LIME_GREEN}
                                px={6}
                                typographyFont="smallCaptionSemiBold"
                                borderRadius={2}
                                lineHeight={14}
                                textTransform="uppercase">
                                {LL.DISCOVER_FOR_YOU_NEW()}
                            </BaseText>
                        )}
                        {!isBlacklisted && (
                            <TouchableOpacity
                                testID={`VBD_COLLECTION_CARD_FAVORITE_${collectionAddress}`}
                                disabled={!collectionMetadata?.id}
                                style={styles.favoriteIcon}
                                onPress={handleToggleFavorite}>
                                <AnimatedBaseIcon
                                    name={isFavorite ? "icon-star-on" : "icon-star"}
                                    size={16}
                                    color={COLORS.WHITE}
                                    style={animatedStyles}
                                />
                            </TouchableOpacity>
                        )}
                    </LinearGradient>
                </BaseView>

                <BlurView style={styles.bottom} overlayColor="transparent" blurAmount={10}>
                    <BaseView
                        flexDirection="row"
                        alignItems="center"
                        justifyContent="space-between"
                        p={8}
                        gap={8}
                        bg={COLORS.BLACK_RGBA_30}>
                        <BaseText
                            typographyFont="captionSemiBold"
                            color={COLORS.WHITE_RGBA_90}
                            flexDirection="row"
                            flex={1}
                            numberOfLines={1}>
                            {collectionMetadata?.name
                                ? collectionMetadata?.name
                                : AddressUtils.humanAddress(collectionAddress)}
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
        </TouchableOpacity>
    )
}

const baseStyles = () =>
    StyleSheet.create({
        card: {
            flex: 1,
            aspectRatio: 0.8791,
            borderRadius: 12,
            overflow: "hidden",
            backgroundColor: COLORS.PURPLE,
            position: "relative",
            maxWidth: "50%",
        },
        image: {
            width: "100%",
            height: "100%",
            position: "relative",
        },
        bottom: { position: "absolute", bottom: 0, left: 0, width: "100%" },
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
            alignItems: "center",
            minHeight: 32,
        },
        favoriteContainerRight: {
            justifyContent: "flex-end",
        },
        favoriteContainerLeft: {
            justifyContent: "flex-start",
        },
        favoriteContainerBetween: {
            justifyContent: "space-between",
        },
        favoriteIcon: {
            marginRight: 4,
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
