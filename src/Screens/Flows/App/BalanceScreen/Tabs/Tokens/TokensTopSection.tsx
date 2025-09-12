import React, { useCallback } from "react"
import { FlatList, ListRenderItemInfo } from "react-native"
import { BaseSpacer } from "~Components"
import { FungibleTokenWithBalance } from "~Model"
import { selectTokensWithBalances, useAppSelector } from "~Storage/Redux"
import { TokenCard } from "./TokenCard"

const ItemSeparator = () => <BaseSpacer height={8} />

export const TokensTopSection = () => {
    const tokenBalances = useAppSelector(selectTokensWithBalances)

    const renderItem = useCallback(
        ({ item }: ListRenderItemInfo<FungibleTokenWithBalance>) => <TokenCard token={item} />,
        [],
    )
    return (
        <FlatList
            data={tokenBalances}
            keyExtractor={item => item.address}
            renderItem={renderItem}
            ItemSeparatorComponent={ItemSeparator}
        />
    )
}
