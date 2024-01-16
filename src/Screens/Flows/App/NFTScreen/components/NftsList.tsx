import { FlashList } from "@shopify/flash-list"
import React, { useCallback } from "react"
import { StyleSheet } from "react-native"
import DropShadow from "react-native-drop-shadow"
import { ColorThemeType, useThemedStyles } from "~Common"
import { BaseText, BaseView } from "~Components"
import { NFTItem } from "../NFTScreen"

const ITEM_SIZE: number = 152
const ITEM_SPACING: number = 16
const LIST_HEIGHT: number = 184

type Props = {
    nfts: NFTItem[]
}

export const NftsList = ({ nfts }: Props) => {
    const { styles: themedStyles } = useThemedStyles(baseStyles)
    const renderSeparator = useCallback(
        () => <BaseView style={{ width: ITEM_SPACING }} />,
        [],
    )

    return (
        <BaseView w={100} style={{ height: LIST_HEIGHT }}>
            <FlashList
                data={nfts}
                keyExtractor={item => item.key}
                ItemSeparatorComponent={renderSeparator}
                contentContainerStyle={themedStyles.listContainer}
                renderItem={({ item }) => {
                    return (
                        <DropShadow style={themedStyles.cardShadow}>
                            <BaseView
                                style={[
                                    themedStyles.nftCard,
                                    {
                                        backgroundColor: item.backgroundColor,
                                    },
                                ]}>
                                <BaseText>{item.label}</BaseText>
                            </BaseView>
                        </DropShadow>
                    )
                }}
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
