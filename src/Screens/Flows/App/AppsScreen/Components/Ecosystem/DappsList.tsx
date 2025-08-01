import { useScrollToTop } from "@react-navigation/native"
import React, { useCallback, useRef } from "react"
import { FlatList, ListRenderItemInfo, StyleSheet } from "react-native"
import { BaseSpacer } from "~Components"
import { DiscoveryDApp } from "~Constants"
import { DAppHorizontalCard } from "~Screens/Flows/App/DiscoverScreen/Components/DAppHorizontalCard"
import { DappHorizontalCardSkeleton } from "~Screens/Flows/App/DiscoverScreen/Components/DappHorizontalCardSkeleton"

type Props = {
    items: DiscoveryDApp[]
    onOpenDApp: (dapp: DiscoveryDApp) => void
    onMorePress: (dapp: DiscoveryDApp) => void
    isLoading: boolean
}

export const DAppsList = ({ items, onMorePress, onOpenDApp, isLoading }: Props) => {
    const flatListRef = useRef(null)
    useScrollToTop(flatListRef)

    const renderItem = useCallback(
        ({ item }: ListRenderItemInfo<DiscoveryDApp>) => {
            return (
                <DAppHorizontalCard
                    dapp={item}
                    onOpenDApp={onOpenDApp}
                    onPress={() => {
                        onMorePress(item)
                    }}
                />
            )
        },
        [onMorePress, onOpenDApp],
    )

    const renderItemSeparator = useCallback(() => {
        return <BaseSpacer height={24} />
    }, [])

    const renderSkeletonItem = useCallback(() => {
        return <DappHorizontalCardSkeleton />
    }, [])

    if (isLoading && items.length === 0) {
        return (
            <FlatList
                renderItem={renderSkeletonItem}
                data={[1, 2, 3, 4, 5, 6, 7]}
                keyExtractor={item => item.toString()}
                scrollEnabled={false}
                shouldRasterizeIOS
                ItemSeparatorComponent={renderItemSeparator}
                contentContainerStyle={styles.flatListPadding}
            />
        )
    }

    return (
        <FlatList
            ref={flatListRef}
            data={items}
            scrollEnabled={true}
            keyExtractor={item => item.href}
            contentContainerStyle={styles.flatListPadding}
            ItemSeparatorComponent={renderItemSeparator}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            renderItem={renderItem}
        />
    )
}

const styles = StyleSheet.create({
    flatListPadding: { paddingBottom: 96 },
})
