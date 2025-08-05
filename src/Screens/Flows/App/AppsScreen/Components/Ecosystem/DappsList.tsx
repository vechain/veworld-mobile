import { useScrollToTop } from "@react-navigation/native"
import React, { useCallback, useRef } from "react"
import { FlatList, ListRenderItemInfo, StyleSheet } from "react-native"
import Animated from "react-native-reanimated"
import { BaseSpacer } from "~Components"
import { DiscoveryDApp } from "~Constants"
import { DappHorizontalCardSkeleton } from "~Screens/Flows/App/DiscoverScreen/Components/DappHorizontalCardSkeleton"
import { DAppHorizontalCardV2 } from "./DAppHorizontalCardV2"

type Props = {
    items: DiscoveryDApp[]
    onOpenDApp: (dapp: DiscoveryDApp) => void
    onMorePress: (dapp: DiscoveryDApp) => void
    isLoading: boolean
}

const keyExtractor = (dapp: DiscoveryDApp) => dapp.href

export const DAppsList = ({ items, onMorePress, onOpenDApp, isLoading }: Props) => {
    const flatListRef = useRef(null)
    useScrollToTop(flatListRef)

    const renderItem = useCallback(
        ({ item }: ListRenderItemInfo<DiscoveryDApp>) => {
            return (
                <DAppHorizontalCardV2
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

    // const getItemCount = useCallback((data: any) => (Array.isArray(data) ? data.length : 0), [])
    // const getItem = useCallback((data: any, index: number) => (Array.isArray(data) ? data[index] : null), [])

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
        <Animated.FlatList
            ref={flatListRef}
            data={items}
            scrollEnabled={true}
            keyExtractor={keyExtractor}
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
