import { useNavigation } from "@react-navigation/native"
import React, { memo, useCallback, useMemo } from "react"
import { TouchableOpacity, StyleSheet } from "react-native"
import { COLORS, SCREEN_WIDTH } from "~Constants"
import { NFTImage, BaseText, BaseView, LongPressProvider } from "~Components"
import { NFTMediaType, NonFungibleTokenCollection } from "~Model"
import { Routes } from "~Navigation"
import {
    removeBlackListCollection,
    selectSelectedAccount,
    selectSelectedNetwork,
    setBlackListCollection,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"
import { NFTPlaceholder } from "~Assets"
import HapticsService from "~Services/HapticsService"
import { useNFTMetadataResolver } from "~Hooks/useNFTMetadataResolver"

type Props = {
    collection: NonFungibleTokenCollection
    index: number
    isHidden?: boolean
}

enum ItemTitle {
    HIDE_COLLECTION = "Hide collection",
    SHOW_COLLECTION = "Show collection",
}

export const NFTCollectionView = memo(
    ({ collection, index, isHidden = false }: Props) => {
        const nav = useNavigation()
        const network = useAppSelector(selectSelectedNetwork)
        const dispatch = useAppDispatch()
        const { mediaType, nftWithMetadata: collectionWithMetadata } =
            useNFTMetadataResolver({
                nft: collection,
            })

        const selectedAccount = useAppSelector(selectSelectedAccount)

        const CollectionItem = useMemo(
            () => [
                {
                    title: isHidden
                        ? ItemTitle.SHOW_COLLECTION
                        : ItemTitle.HIDE_COLLECTION,
                },
            ],
            [isHidden],
        )

        const onCollectionPress = useCallback(() => {
            HapticsService.triggerImpact({ level: "Light" })
            nav.navigate(Routes.NFT_COLLECTION_DETAILS, {
                collectionAddress: collectionWithMetadata.address,
            })
        }, [nav, collectionWithMetadata.address])

        const handleOnItemLongPress = useCallback(
            (_index: number) => {
                const itemAction = CollectionItem[_index]?.title

                if (itemAction === ItemTitle.HIDE_COLLECTION)
                    dispatch(
                        setBlackListCollection({
                            network: network.type,
                            collection: collectionWithMetadata,
                            accountAddress: selectedAccount.address,
                        }),
                    )

                if (itemAction === ItemTitle.SHOW_COLLECTION)
                    dispatch(
                        removeBlackListCollection({
                            network: network.type,
                            collection: collectionWithMetadata,
                            accountAddress: selectedAccount.address,
                        }),
                    )
            },
            [
                CollectionItem,
                collectionWithMetadata,
                dispatch,
                network,
                selectedAccount.address,
            ],
        )

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
                        justifyContent:
                            index % 2 === 0 ? "flex-start" : "flex-end",
                    },
                ]}>
                <LongPressProvider
                    items={CollectionItem}
                    action={handleOnItemLongPress}>
                    <BaseView style={baseStyles.nftCollectionNameBarRadius}>
                        <NFTImage
                            uri={
                                mediaType === NFTMediaType.IMAGE
                                    ? collectionWithMetadata.image
                                    : NFTPlaceholder
                            }
                            style={baseStyles.nftPreviewImage}
                        />

                        <BaseView
                            style={baseStyles.nftCollectionNameBar}
                            flexDirection="row"
                            alignItems="center"
                            justifyContent="space-between">
                            <BaseText
                                color={COLORS.WHITE}
                                numberOfLines={1}
                                w={80}>
                                {collectionWithMetadata.name}
                            </BaseText>
                            <BaseView
                                style={baseStyles.nftCounterLabel}
                                justifyContent="center"
                                alignItems="center">
                                <BaseText color={COLORS.WHITE}>
                                    {!collectionWithMetadata.hasCount && "+"}
                                    {collectionWithMetadata.balanceOf}
                                </BaseText>
                            </BaseView>
                        </BaseView>
                    </BaseView>
                </LongPressProvider>
            </TouchableOpacity>
        )
    },
)

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
