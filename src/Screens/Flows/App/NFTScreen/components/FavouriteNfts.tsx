import { FlashList } from "@shopify/flash-list"
import React, { useMemo } from "react"
import { StyleSheet } from "react-native"
import DropShadow from "react-native-drop-shadow"
import { ColorThemeType, useThemedStyles } from "~Common"
import { BaseSpacer, BaseText, BaseView } from "~Components"
import { useI18nContext } from "~i18n"
import { NFTItem } from "../NFTScreen"

const ITEM_SIZE: number = 152
const ITEM_SPACING: number = 16
const LIST_HEIGHT: number = 184

const NUM_ITEMS = 20
function getColor(i: number) {
    const multiplier = 255 / (NUM_ITEMS - 1)
    const colorVal = i * multiplier
    return `rgb(${colorVal}, ${Math.abs(128 - colorVal)}, ${255 - colorVal})`
}

const initialData: NFTItem[] = [...Array(NUM_ITEMS)].map((d, index) => {
    const backgroundColor = getColor(index)
    return {
        key: `item-${index}`,
        label: String(index) + "",
        height: 100,
        width: 60 + Math.random() * 40,
        backgroundColor,
    }
})

export const FavouriteNfts = () => {
    const { LL } = useI18nContext()

    const { styles: themedStyles } = useThemedStyles(baseStyles)

    const favouriteList = useMemo(() => {
        const renderSeparator = () => (
            <BaseView style={{ width: ITEM_SPACING }} />
        )

        return (
            <BaseView w={100} style={{ height: LIST_HEIGHT }}>
                <FlashList
                    data={initialData}
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
                                            backgroundColor:
                                                item.backgroundColor,
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
                            ITEM_SIZE * initialData.length +
                            (initialData.length - 1) * ITEM_SPACING,
                    }}
                />
            </BaseView>
        )
    }, [themedStyles])

    return (
        <BaseView mx={20}>
            <BaseText typographyFont="subTitle">
                {LL.COMMON_LBL_FAVOURITES()}
            </BaseText>
            <BaseSpacer height={24} />
            {favouriteList}
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

        nftPreviewImage: {
            width: 32,
            height: 32,
            backgroundColor: "pink",
            borderRadius: 16,
            marginRight: 10,
        },

        cardShadow: theme.shadows.nftCard,
    })
