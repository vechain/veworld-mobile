import React, { useCallback, useMemo } from "react"
import { FlatList, ListRenderItemInfo } from "react-native"
import { BaseSpacer } from "~Components"
import { B3TR, VOT3 } from "~Constants"
import { FungibleTokenWithBalance } from "~Model"
import { selectTokensWithBalances, useAppSelector } from "~Storage/Redux"
import { BigNutils } from "~Utils"
import { TokenCard } from "../../Components/Tokens/TokenCard"

const ItemSeparator = () => <BaseSpacer height={8} />

export const TokensTopSection = () => {
    const tokenBalances = useAppSelector(selectTokensWithBalances)

    const parsedBalances = useMemo(() => {
        const notVBDBalances = tokenBalances.filter(tb => ![B3TR.symbol, VOT3.symbol].includes(tb.symbol))
        const vbdBalances = tokenBalances.filter(tb => [B3TR.symbol, VOT3.symbol].includes(tb.symbol))
        const totalVbd = vbdBalances.reduce((acc, curr) => acc.plus(curr.balance.balance), BigNutils("0"))
        if (vbdBalances.length === 0) return notVBDBalances
        return [
            ...notVBDBalances,
            {
                address: B3TR.address,
                balance: {
                    balance: totalVbd.toBigInt.toString(),
                    isHidden: vbdBalances.some(token => token.balance.isHidden),
                    timeUpdated: vbdBalances[0].balance.timeUpdated,
                    tokenAddress: vbdBalances[0].balance.tokenAddress,
                },
                custom: false,
                decimals: B3TR.decimals,
                icon: B3TR.icon,
                name: B3TR.name,
                symbol: B3TR.symbol,
                desc: B3TR.desc,
            },
        ] satisfies FungibleTokenWithBalance[]
    }, [tokenBalances])

    const renderItem = useCallback(
        ({ item }: ListRenderItemInfo<FungibleTokenWithBalance>) => <TokenCard token={item} />,
        [],
    )
    return (
        <FlatList
            data={parsedBalances}
            keyExtractor={item => item.address}
            renderItem={renderItem}
            ItemSeparatorComponent={ItemSeparator}
        />
    )
}
