import { useNavigation } from "@react-navigation/native"
import { FlashList } from "@shopify/flash-list"
import React, { useCallback } from "react"
import { StyleSheet, TouchableOpacity } from "react-native"
import { ColorThemeType, useThemedStyles } from "~Common"
import { COLORS } from "~Common/Theme"
import {
    BaseIcon,
    BaseImage,
    BaseSpacer,
    BaseText,
    BaseView,
} from "~Components"
import { NonFungibleToken } from "~Model"
import { Routes } from "~Navigation"

const ITEM_SIZE: number = 152
const ITEM_SPACING: number = 16
const LIST_HEIGHT: number = 184

type SeeAllButton =
    | {
          title: string
          image: string
          tokenId: string
          collectionAddress: string
      }
    | undefined

type TokenArray = Array<NonFungibleToken | SeeAllButton>
type Props = {
    nfts: TokenArray
}

export const NftsList = ({ nfts }: Props) => {
    const { styles: themedStyles } = useThemedStyles(baseStyles)
    const nav = useNavigation()

    const renderSeparator = useCallback(
        () => <BaseView style={{ width: ITEM_SPACING }} />,
        [],
    )

    const onNftPress = useCallback(
        (nft: NonFungibleToken) =>
            nav.navigate(Routes.NFT_DETAILS, { collectionData: {}, nft }),
        [nav],
    )

    const onSeeAllPress = useCallback(
        (collectionAddress: string) =>
            nav.navigate(Routes.NFT_COLLECTION_DETAILS, {
                collectionAddress,
            }),
        [nav],
    )

    const renderNft = useCallback(
        ({ item }: { item: NonFungibleToken | SeeAllButton }) => {
            if (!item) return null

            if (item.tokenId === "see-all") {
                let _item = item as SeeAllButton
                if (!_item) return null

                return (
                    <BaseView>
                        <TouchableOpacity
                            onPress={() =>
                                onSeeAllPress(_item!.collectionAddress)
                            }>
                            <BaseView
                                style={[
                                    themedStyles.nftCard,
                                    {
                                        backgroundColor: COLORS.LIME_GREEN,
                                    },
                                ]}>
                                <BaseIcon name={_item.image} size={46} />
                                <BaseSpacer height={4} />
                                <BaseText
                                    typographyFont="bodyMedium"
                                    color={COLORS.DARK_PURPLE}>
                                    {_item.title}
                                </BaseText>
                            </BaseView>
                        </TouchableOpacity>
                    </BaseView>
                )
            } else {
                let _item = item as NonFungibleToken
                return (
                    <BaseView>
                        <TouchableOpacity onPress={() => onNftPress(_item)}>
                            <BaseView style={[themedStyles.nftCard]}>
                                <BaseImage
                                    uri={_item.image}
                                    w={ITEM_SIZE}
                                    h={ITEM_SIZE}
                                />
                            </BaseView>
                        </TouchableOpacity>
                    </BaseView>
                )
            }
        },
        [onNftPress, onSeeAllPress, themedStyles.nftCard],
    )

    return (
        <BaseView w={100} style={{ height: LIST_HEIGHT }}>
            <FlashList
                data={nfts}
                keyExtractor={item => String(item?.tokenId)}
                ItemSeparatorComponent={renderSeparator}
                contentContainerStyle={themedStyles.listContainer}
                renderItem={renderNft}
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
                horizontal
                estimatedItemSize={ITEM_SIZE}
                estimatedListSize={{
                    height: LIST_HEIGHT,
                    width:
                        ITEM_SIZE * nfts.length +
                        (nfts.length - 1) * ITEM_SPACING,
                }}
            />
        </BaseView>
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        headerStyle: { paddingHorizontal: 20 },
        listContainer: {
            paddingVertical: ITEM_SPACING,
            paddingHorizontal: 20,
        },
        nftCard: {
            width: ITEM_SIZE,
            height: ITEM_SIZE,
            borderRadius: ITEM_SPACING,
            backgroundColor: theme.colors.card,
            overflow: "hidden",
            justifyContent: "center",
            alignItems: "center",
        },
        cardShadow: theme.shadows.nftCard,
    })
