import { useNavigation } from "@react-navigation/native"
import { FlashList } from "@shopify/flash-list"
import { isEmpty } from "lodash"
import React, { useCallback } from "react"
import { StyleSheet, TouchableOpacity } from "react-native"
import DropShadow from "react-native-drop-shadow"
import { ColorThemeType, useThemedStyles } from "~Common"
import { BaseImage, BaseView } from "~Components"
import { NonFungibleToken } from "~Model"
import { Routes } from "~Navigation"

const ITEM_SIZE: number = 152
const ITEM_SPACING: number = 16
const LIST_HEIGHT: number = 184

type Props = {
    nfts: NonFungibleToken[]
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

    const renderNft = useCallback(
        ({ item }: { item: NonFungibleToken }) => {
            if (!isEmpty(item.image)) {
                return (
                    <DropShadow style={themedStyles.cardShadow}>
                        <TouchableOpacity onPress={() => onNftPress(item)}>
                            <BaseView style={[themedStyles.nftCard]}>
                                <BaseImage
                                    uri={item.image}
                                    w={ITEM_SIZE}
                                    h={ITEM_SIZE}
                                />
                            </BaseView>
                        </TouchableOpacity>
                    </DropShadow>
                )
            } else {
                return null
            }
        },
        [onNftPress, themedStyles.cardShadow, themedStyles.nftCard],
    )

    return (
        <BaseView w={100} style={{ height: LIST_HEIGHT }}>
            <FlashList
                data={nfts}
                keyExtractor={item => String(item.tokenId)}
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
