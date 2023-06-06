import React, { useCallback, useEffect, useState } from "react"
import { BaseSafeArea, BaseSpacer, BaseView } from "~Components"
import { NftScreenHeader } from "./components"
import { selectNftCollections, useAppSelector } from "~Storage/Redux"
import { NonFungibleTokenCollection } from "~Model"
import { isEmpty } from "lodash"
import { NftSkeleton } from "./components/NftSkeleton"
import { StyleSheet, FlatList } from "react-native"
import {
    useNFTCollections,
    usePlatformBottomInsets,
    useThemedStyles,
} from "~Common"
import { NFTView } from "../Components"
import { usePagination } from "../usePagination"

type NFTListProps = {
    item: NonFungibleTokenCollection
    index: number
}

export const NFTScreen = () => {
    const { calculateBottomInsets } = usePlatformBottomInsets()

    // To prevent fetching next page of activities on FlashList mount
    const [hasScrolled, setHasScrolled] = useState(false)

    const onScroll = useCallback(() => {
        if (!hasScrolled) setHasScrolled(true)
    }, [hasScrolled])

    const nftCollections = useAppSelector(selectNftCollections)

    const { getCollections } = useNFTCollections()

    const { fetchwithPagination } = usePagination()

    useEffect(() => {
        getCollections(0, 1)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const fetchActivities = useCallback(() => {
        fetchwithPagination(
            nftCollections.pagination.totalElements,
            nftCollections.collections.length,
            page => {
                getCollections(page, 1)
            },
        )
    }, [
        fetchwithPagination,
        getCollections,
        nftCollections.collections.length,
        nftCollections.pagination.totalElements,
    ])

    const { styles } = useThemedStyles(baseStyles(calculateBottomInsets))

    const renderSeparator = useCallback(() => <BaseSpacer height={16} />, [])

    const renderNftCollection = useCallback(({ item, index }: NFTListProps) => {
        return <NFTView item={item} index={index} isCollection />
    }, [])

    return (
        <BaseSafeArea grow={1} testID="NFT_Screen">
            <NftScreenHeader />

            <BaseView flex={1} mx={20} justifyContent="center">
                {!isEmpty(nftCollections.collections) ? (
                    <FlatList
                        data={nftCollections.collections}
                        contentContainerStyle={styles.listContainer}
                        numColumns={2}
                        keyExtractor={item => String(item.address)}
                        ItemSeparatorComponent={renderSeparator}
                        renderItem={renderNftCollection}
                        showsVerticalScrollIndicator={false}
                        showsHorizontalScrollIndicator={false}
                        onScroll={onScroll}
                        onEndReachedThreshold={1}
                        // onEndReached={fetchActivities}
                        onEndReached={hasScrolled ? fetchActivities : undefined}
                    />
                ) : (
                    <NftSkeleton />
                )}
            </BaseView>
        </BaseSafeArea>
    )
}

const baseStyles = (calculateBottomInsets: number) => () =>
    StyleSheet.create({
        listContainer: {
            paddingTop: 24,
            paddingBottom: calculateBottomInsets,
        },
    })
