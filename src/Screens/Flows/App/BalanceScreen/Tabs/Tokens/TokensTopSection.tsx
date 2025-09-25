import React, { useCallback } from "react"
import { FlatList, ListRenderItemInfo } from "react-native"
import { BaseSpacer } from "~Components"
import { useSortedTokensByFiatValue } from "~Hooks/useSortedTokensByFiatValue"
import { FungibleTokenWithBalance } from "~Model"
import { TokenCard } from "../../Components/Tokens/TokenCard"

const ItemSeparator = () => <BaseSpacer height={8} />

export const TokensTopSection = () => {
    const { tokens } = useSortedTokensByFiatValue()

    const renderItem = useCallback(
        ({ item }: ListRenderItemInfo<FungibleTokenWithBalance>) => <TokenCard token={item} />,
        [],
    )

    const getItemLayout = useCallback(
        (_: any, index: number) => ({
            length: 80,
            offset: 80 * index,
            index,
        }),
        [],
    )

    return (
        <FlatList
            data={tokens}
            keyExtractor={item => item.address}
            renderItem={renderItem}
            ItemSeparatorComponent={ItemSeparator}
            // Mobile performance optimizations
            getItemLayout={getItemLayout}
            removeClippedSubviews={true}
            windowSize={10}
            maxToRenderPerBatch={5}
            initialNumToRender={10}
            updateCellsBatchingPeriod={50}
        />
    )
}
