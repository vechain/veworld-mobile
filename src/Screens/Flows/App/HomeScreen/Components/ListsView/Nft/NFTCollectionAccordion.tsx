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

export const NFTCollectionAccordion = ({ collection }: Props) => {
    const { styles: themedStyles } = useThemedStyles(baseStyles)
    const headerComponent = useMemo(() => {
        return (
            <BaseView orientation="row" align="center">
                <BaseView style={themedStyles.nftPreviewImage} />
                <BaseText typographyFont="subTitle">
                    {collection.title}
                </BaseText>
            </BaseView>
        )
    }, [collection, themedStyles])

    const bodyComponent = useMemo(() => {
        const renderSeparator = () => <BaseView style={{ width: 16 }} />

        return (
            <BaseView w={100} style={{ height: 184 }}>
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
                    estimatedItemSize={collection.list.length}
                    estimatedListSize={{
                        height: 184,
                        width:
                            152 * collection.list.length +
                            (collection.list.length - 1) * 16,
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
            paddingVertical: 16,
            paddingHorizontal: 20,
        },
        nftCard: {
            width: 152,
            height: 152,
            borderRadius: 16,
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

// const styles = StyleSheet.create({
//     headerContainer: {
//         width: "100%",
//         flexDirection: "row",
//     },
//     headerContent: {
//         width: "100%",
//         flexDirection: "row",
//         justifyContent: "space-between",
//         alignItems: "center",
//     },
//     bodyContainer: { width: "100%", overflow: "hidden" },
//     bodyContent: { width: "100%" },
//     chevronIcon: {
//         marginRight: 20,
//     },
// })
