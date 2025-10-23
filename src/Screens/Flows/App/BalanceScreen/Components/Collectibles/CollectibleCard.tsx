import { useQuery } from "@tanstack/react-query"
import React, { useCallback } from "react"
import { Pressable, StyleSheet } from "react-native"
import { ImageStyle } from "react-native-fast-image"
import LinearGradient from "react-native-linear-gradient"
import { BaseIcon, BaseText, BaseView, BlurView, NFTImageComponent } from "~Components"
import { COLORS } from "~Constants"
import { useNFTMedia, useThemedStyles } from "~Hooks"
import { useCollectibleDetails } from "~Hooks/useCollectibleDetails"
import { NFTMediaType } from "~Model"
import {
    isNftFavorite,
    selectSelectedAccount,
    selectSelectedNetwork,
    toggleFavorite,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"

type Props = {
    address: string
    tokenId: string
    onPress: (args: { address: string; tokenId: string }) => void
}

export const CollectibleCard = ({ address, tokenId, onPress }: Props) => {
    const { styles } = useThemedStyles(baseStyles)
    const isFavorite = useAppSelector(state => isNftFavorite(state, address, tokenId))
    const account = useAppSelector(selectSelectedAccount)
    const network = useAppSelector(selectSelectedNetwork)
    const details = useCollectibleDetails({ address, tokenId })

    const { fetchMedia } = useNFTMedia()
    const dispatch = useAppDispatch()

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

    const onFavoriteToggle = useCallback(() => {
        dispatch(toggleFavorite({ address, tokenId, owner: account.address, genesisId: network.genesis.id }))
    }, [account.address, address, dispatch, network.genesis.id, tokenId])

    return (
        <Pressable style={styles.root} onPress={handlePress}>
            <Pressable style={styles.favoriteContainer} onPress={onFavoriteToggle}>
                <BaseIcon name={isFavorite ? "icon-star-on" : "icon-star"} color={COLORS.WHITE} size={16} />
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
        },
        image: {
            height: "100%",
            width: "100%",
        },
        favoriteContainer: {
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
