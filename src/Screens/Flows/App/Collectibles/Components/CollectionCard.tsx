import { useQuery } from "@tanstack/react-query"
import React, { useMemo } from "react"
import { StyleSheet, TouchableOpacity } from "react-native"
import { BaseText, BaseView, BlurView } from "~Components"
import { FastImageBackground } from "~Components/Reusable/FastImageBackground"
import { COLORS } from "~Constants"
import { useFormatFiat, useNFTMedia, useThemedStyles } from "~Hooks"
import { URIUtils } from "~Utils"
import { formatDisplayNumber } from "~Utils/StandardizedFormatting"
import { useCollectionMetadata } from "../Hooks/useCollectionMetadata"

type Props = {
    collectionAddress: string
    onPress: (address: string) => void
}

export const CollectionCard = ({ collectionAddress, onPress }: Props) => {
    const { styles } = useThemedStyles(baseStyles)
    const { data: collectionMetadata, isLoading } = useCollectionMetadata(collectionAddress)
    const { fetchMedia } = useNFTMedia()
    const { formatLocale } = useFormatFiat()

    const { data: media } = useQuery({
        queryKey: ["COLLECTIBLES", "COLLECTION", "MEDIA", collectionMetadata?.image],
        queryFn: () => fetchMedia(collectionMetadata?.image!),
        enabled: !!collectionMetadata?.image,
        staleTime: 5 * 60 * 60 * 1000,
        gcTime: 24 * 60 * 60 * 1000,
    })

    const imageUri = useMemo(() => {
        if (!media?.image) return undefined
        try {
            return URIUtils.convertUriToUrl(media.image)
        } catch {
            return undefined
        }
    }, [media?.image])

    return (
        <TouchableOpacity disabled={isLoading} activeOpacity={0.8} onPress={() => onPress(collectionAddress)}>
            <BaseView style={styles.card}>
                {imageUri ? (
                    <FastImageBackground source={{ uri: imageUri }} resizeMode="cover" style={styles.image}>
                        <BlurView style={styles.bottom} overlayColor="transparent" blurAmount={10}>
                            <BaseView
                                flexDirection="row"
                                alignItems="center"
                                justifyContent="space-between"
                                p={8}
                                bg={COLORS.BLACK_RGBA_30}>
                                <BaseText
                                    typographyFont="captionSemiBold"
                                    color={COLORS.WHITE_RGBA_90}
                                    flexDirection="row">
                                    {collectionMetadata?.name}
                                </BaseText>
                                {collectionMetadata?.totalSupply && (
                                    <BaseView px={8} py={4} bg={COLORS.WHITE_RGBA_15} borderRadius={99}>
                                        <BaseText typographyFont="smallCaptionMedium" color={COLORS.WHITE_RGBA_90}>
                                            {formatDisplayNumber(collectionMetadata?.totalSupply, {
                                                includeSymbol: false,
                                                locale: formatLocale,
                                                useCompactNotation: true,
                                            })}
                                        </BaseText>
                                    </BaseView>
                                )}
                            </BaseView>
                        </BlurView>
                    </FastImageBackground>
                ) : (
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
                            {collectionMetadata?.totalSupply && (
                                <BaseView px={8} py={4} bg={COLORS.WHITE_RGBA_15} borderRadius={99}>
                                    <BaseText typographyFont="smallCaptionMedium" color={COLORS.WHITE_RGBA_90}>
                                        {formatDisplayNumber(collectionMetadata?.totalSupply, {
                                            includeSymbol: false,
                                            locale: formatLocale,
                                            useCompactNotation: true,
                                        })}
                                    </BaseText>
                                </BaseView>
                            )}
                        </BaseView>
                    </BlurView>
                )}
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
        },
        bottom: { position: "absolute", bottom: 0, left: 0, width: "100%" },
    })
