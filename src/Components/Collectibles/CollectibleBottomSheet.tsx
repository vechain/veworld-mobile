import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import { useQuery } from "@tanstack/react-query"
import React, { RefObject, useMemo } from "react"
import { StyleSheet } from "react-native"
import { ImageStyle } from "react-native-fast-image"
import { BaseBottomSheet, BaseIcon, BaseText, BaseView } from "~Components/Base"
import { BlurView, NFTImageComponent } from "~Components/Reusable"
import { COLORS } from "~Constants"
import { useBottomSheetModal, useNFTMedia, useThemedStyles } from "~Hooks"
import { useCollectibleMetadata } from "~Hooks/useCollectibleMetadata"
import { CollectiblesAvatarActionButton } from "./CollectiblesAvatarActionButton"
import { CollectiblesFavoriteActionButton } from "./CollectiblesFavoriteActionButton"
import { CollectiblesSendActionButton } from "./CollectiblesSendActionButton"

type OpenProps = {
    address: string
    tokenId: string
}

type CollectibleBottomSheetContentProps = OpenProps & {
    onClose: () => void
}

const CollectibleBottomSheetContent = ({ address, tokenId, onClose }: CollectibleBottomSheetContentProps) => {
    const { styles, theme } = useThemedStyles(baseStyles)
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

    return (
        <BaseView flexDirection="column">
            <BaseView w={100} style={styles.rootImage} position="relative">
                <NFTImageComponent style={styles.image as ImageStyle} uri={media?.image} />
                <BlurView style={styles.blurView} overlayColor="transparent" blurAmount={10}>
                    <BaseView bg={"rgba(0,0,0,0.30)"} w={100}>
                        <BaseView
                            flexDirection="row"
                            alignItems="center"
                            px={24}
                            py={16}
                            justifyContent="space-between"
                            w={100}>
                            <BaseText typographyFont="bodySemiBold" color={COLORS.WHITE_RGBA_90} flexDirection="row">
                                {name}
                            </BaseText>
                            <BaseView borderRadius={99} px={8} py={4} bg={COLORS.WHITE_RGBA_15} style={styles.tokenId}>
                                <BaseText
                                    typographyFont="smallCaptionMedium"
                                    color={COLORS.WHITE}
                                    flexDirection="row"
                                    numberOfLines={1}>
                                    #{tokenId}
                                </BaseText>
                            </BaseView>
                        </BaseView>
                    </BaseView>
                </BlurView>
                <BaseIcon
                    style={styles.closeBtn}
                    color={COLORS.WHITE}
                    size={20}
                    name="icon-x"
                    action={onClose}
                    testID="bottom-sheet-close-btn"
                />
            </BaseView>
            <BaseView
                flexDirection="column"
                p={24}
                w={100}
                gap={32}
                bg={theme.isDark ? COLORS.PURPLE_DISABLED : COLORS.WHITE}>
                <BaseView flexDirection="row" gap={8}>
                    <CollectiblesFavoriteActionButton address={address} tokenId={tokenId} />
                    <CollectiblesAvatarActionButton address={address} tokenId={tokenId} image={media?.image} />
                    <CollectiblesSendActionButton address={address} tokenId={tokenId} />
                </BaseView>
            </BaseView>
        </BaseView>
    )
}

export const CollectibleBottomSheet = ({ bsRef }: { bsRef: RefObject<BottomSheetModalMethods> }) => {
    const { onClose } = useBottomSheetModal({ externalRef: bsRef })
    return (
        <BaseBottomSheet<OpenProps> ref={bsRef} floating enablePanDownToClose={false} noMargins>
            {data => <CollectibleBottomSheetContent address={data.address} tokenId={data.tokenId} onClose={onClose} />}
        </BaseBottomSheet>
    )
}

const baseStyles = () =>
    StyleSheet.create({
        blurView: {
            position: "absolute",
            bottom: 0,
            left: 0,
            width: "100%",
        },
        tokenId: {
            maxWidth: "30%",
        },
        image: {
            aspectRatio: 1,
            width: "100%",
        },
        rootImage: {
            aspectRatio: 1,
        },
        closeBtn: {
            position: "absolute",
            top: 12,
            right: 12,
            backgroundColor: "rgba(0, 0, 0, 0.30)",
            borderRadius: 100,
            padding: 10,
        },
    })
