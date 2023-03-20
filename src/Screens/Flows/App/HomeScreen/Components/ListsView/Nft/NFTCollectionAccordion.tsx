import { FlashList } from "@shopify/flash-list"
import React, { useMemo } from "react"
import { StyleSheet } from "react-native"
import DropShadow from "react-native-drop-shadow"
import { ColorThemeType, useThemedStyles } from "~Common"
import { BaseAccordion, BaseText, BaseView } from "~Components"

export type NFTItem = {
    key: string
    label: string
    height: number
    width: number
    backgroundColor: string
}

type Props = {
    collection: { title: string; list: NFTItem[] }
}

const ITEM_SIZE: number = 152
const ITEM_SPACING: number = 16
const LIST_HEIGHT: number = 184

export const NFTCollectionAccordion = ({ collection }: Props) => {
    const { styles: themedStyles } = useThemedStyles(baseStyles)
    const headerComponent = useMemo(() => {
        return (
            <BaseView flexDirection="row">
                <BaseView style={themedStyles.nftPreviewImage} />
                <BaseText typographyFont="subTitle">
                    {collection.title}
                </BaseText>
            </BaseView>
        )
    }, [collection, themedStyles])

    const bodyComponent = useMemo(() => {
        const renderSeparator = () => (
            <BaseView style={{ width: ITEM_SPACING }} />
        )

        return (
            <BaseView w={100} style={{ height: LIST_HEIGHT }}>
                <FlashList
                    data={collection.list}
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
                            ITEM_SIZE * collection.list.length +
                            (collection.list.length - 1) * ITEM_SPACING,
                    }}
                />
            </BaseView>
        )
    }, [collection, themedStyles])

    return (
        <BaseAccordion
            headerComponent={headerComponent}
            headerStyle={themedStyles.headerStyle}
            bodyComponent={bodyComponent}
        />
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
