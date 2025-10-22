import React, { useCallback, useMemo } from "react"
import { BaseSpacer, DescSortIconHeaderButton, Layout } from "~Components"
import { useNFTCollections } from "./Hooks"
import { FlatList, ListRenderItemInfo, StyleSheet } from "react-native"
import { CollectionCard } from "./Components"
import { useThemedStyles } from "~Hooks"

export const CollectionsScreen = () => {
    const { styles } = useThemedStyles(baseStyles)
    const { data: paginatedCollections, isLoading: isCollectionsLoading, fetchNextPage } = useNFTCollections()

    const collectionsData = useMemo(
        () => paginatedCollections?.pages.flatMap(page => page.collections) ?? [],
        [paginatedCollections],
    )

    const renderItem = useCallback(({ item }: ListRenderItemInfo<string>) => {
        return <CollectionCard collectionAddress={item} onPress={() => {}} />
    }, [])

    const renderItemSeparator = useCallback(() => {
        return <BaseSpacer height={8} />
    }, [])

    return (
        <Layout
            title={"Collections"}
            headerRightElement={<DescSortIconHeaderButton testID="COLLECTIONS_SORT_BTN" action={() => {}} />}
            fixedBody={
                !isCollectionsLoading && (
                    <FlatList
                        keyExtractor={item => item}
                        data={collectionsData}
                        renderItem={renderItem}
                        ItemSeparatorComponent={renderItemSeparator}
                        style={styles.list}
                        contentContainerStyle={styles.listContentContainer}
                        pagingEnabled
                        onEndReachedThreshold={0.3}
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
            paddingVertical: 24,
        },
    })
