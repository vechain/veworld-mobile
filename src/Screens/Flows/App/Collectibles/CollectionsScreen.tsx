import { useNavigation } from "@react-navigation/native"
import React, { useCallback, useMemo } from "react"
import { FlatList, ListRenderItemInfo, StyleSheet } from "react-native"
import { BaseSpacer, Layout } from "~Components"
import { useThemedStyles } from "~Hooks"
import { Routes } from "~Navigation"
import { CollectionCard } from "./Components"
import { useNFTCollections } from "./Hooks"

export const CollectionsScreen = () => {
    const { styles } = useThemedStyles(baseStyles)
    const nav = useNavigation()
    const { data: paginatedCollections, isLoading: isCollectionsLoading, fetchNextPage } = useNFTCollections()

    const collectionsData = useMemo(
        () => paginatedCollections?.pages.flatMap(page => page.collections) ?? [],
        [paginatedCollections],
    )

    const renderItem = useCallback(
        ({ item }: ListRenderItemInfo<string>) => {
            return (
                <CollectionCard
                    collectionAddress={item}
                    onPress={() => {
                        nav.navigate(Routes.COLLECTIBLES_COLLECTION_DETAILS, {
                            collectionAddress: item,
                        })
                    }}
                />
            )
        },
        [nav],
    )

    const renderItemSeparator = useCallback(() => {
        return <BaseSpacer height={8} />
    }, [])

    return (
        <Layout
            title={"Collections"}
            fixedBody={
                !isCollectionsLoading && (
                    <FlatList
                        keyExtractor={item => item}
                        data={collectionsData}
                        renderItem={renderItem}
                        ItemSeparatorComponent={renderItemSeparator}
                        style={styles.list}
                        contentContainerStyle={styles.listContentContainer}
                        onEndReached={() => {
                            fetchNextPage()
                        }}
                        showsVerticalScrollIndicator={false}
                    />
                )
            }
        />
    )
}

const baseStyles = () =>
    StyleSheet.create({
        list: {
            paddingHorizontal: 16,
        },
        listContentContainer: {
            paddingTop: 16,
            paddingBottom: 24,
        },
    })
