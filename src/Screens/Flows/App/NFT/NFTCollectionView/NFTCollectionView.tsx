import { useNavigation } from "@react-navigation/native"
import React, { useCallback, useMemo } from "react"
import { TouchableOpacity, StyleSheet } from "react-native"
import { COLORS, SCREEN_WIDTH } from "~Constants"
import { NFTImage, BaseText, BaseView, LongPressProvider } from "~Components"
import { NFTMediaType, NonFungibleTokenCollection } from "~Model"
import { Routes } from "~Navigation"
import { NFTPlaceholder } from "~Assets"
import HapticsService from "~Services/HapticsService"
import { useToggleCollection } from "../NFTCollectionDetailScreen/Components/Hooks/useToggleCollection"

type Props = {
    collection: NonFungibleTokenCollection
    index: number
}

enum ItemTitle {
    HIDE_COLLECTION = "Hide collection",
    SHOW_COLLECTION = "Show collection",
}

export const NFTCollectionView = ({ collection, index }: Props) => {
    const nav = useNavigation()

    const { onToggleCollection, isBlacklisted } =
        useToggleCollection(collection)

    const CollectionItem = useMemo(
        () => [
            {
                title: isBlacklisted
                    ? ItemTitle.SHOW_COLLECTION
                    : ItemTitle.HIDE_COLLECTION,
            },
        ],
        [isBlacklisted],
    )

    const onCollectionPress = useCallback(() => {
        HapticsService.triggerImpact({ level: "Light" })
        nav.navigate(Routes.NFT_COLLECTION_DETAILS, {
            collectionAddress: collection.address,
        })
    }, [nav, collection.address])

    return (
        <TouchableOpacity
            activeOpacity={0.6}
            // Workaround -> https://github.com/mpiannucci/react-native-context-menu-view/issues/60#issuecomment-1453864955
            onLongPress={() => {}}
            onPress={onCollectionPress}
            style={[
                baseStyles.nftContainer,
                // eslint-disable-next-line react-native/no-inline-styles
                {
                    justifyContent: index % 2 === 0 ? "flex-start" : "flex-end",
                },
            ]}>
            <LongPressProvider
                items={CollectionItem}
                action={onToggleCollection}>
                <BaseView style={baseStyles.nftCollectionNameBarRadius}>
                    <NFTImage
                        uri={
                            collection.mediaType === NFTMediaType.IMAGE
                                ? collection.image
                                : NFTPlaceholder
                        }
                        style={baseStyles.nftPreviewImage}
                    />

                    <BaseView
                        style={baseStyles.nftCollectionNameBar}
                        flexDirection="row"
                        alignItems="center"
                        justifyContent="space-between">
                        <BaseText color={COLORS.WHITE} numberOfLines={1} w={80}>
                            {collection.name}
                        </BaseText>
                        {collection.balanceOf > 0 && (
                            <BaseView
                                style={baseStyles.nftCounterLabel}
                                justifyContent="center"
                                alignItems="center">
                                <BaseText color={COLORS.WHITE}>
                                    {!collection.hasCount && "+"}
                                    {collection.balanceOf}
                                </BaseText>
                            </BaseView>
                        )}
                    </BaseView>
                </BaseView>
            </LongPressProvider>
        </TouchableOpacity>
    )
}

const baseStyles = StyleSheet.create({
    nftContainer: {
        flexWrap: "wrap",
        flexDirection: "row",
        justifyContent: "space-between",
        width: "50%",
    },

    nftPreviewImage: {
        width: SCREEN_WIDTH / 2 - 30,
        height: 164,
        borderRadius: 13,
    },

    nftCollectionNameBar: {
        position: "absolute",
        height: 34,
        bottom: 0,
        left: 0,
        width: SCREEN_WIDTH / 2 - 30,
        backgroundColor: COLORS.DARK_PURPLE_RBGA,
        paddingHorizontal: 12,
    },
    nftCollectionNameBarRadius: {
        overflow: "hidden",
        borderRadius: 13,
    },
    nftCounterLabel: {
        minWidth: 20,
        height: 20,
        paddingHorizontal: 4,
        borderRadius: 13,
        backgroundColor: COLORS.DARK_PURPLE,
    },
})
