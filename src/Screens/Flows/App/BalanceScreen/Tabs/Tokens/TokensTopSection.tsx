import React, { useCallback, useMemo } from "react"
import { FlatList, ListRenderItemInfo } from "react-native"
import { BaseSpacer } from "~Components"
import { VET, VTHO } from "~Constants"
import { useNonVechainTokensBalance } from "~Hooks/useNonVechainTokensBalance"
import { useMultipleTokensBalance } from "~Hooks/useTokenBalance"
import { FungibleTokenWithBalance } from "~Model"
import { selectNetworkVBDTokens, useAppSelector } from "~Storage/Redux"
import { BigNutils } from "~Utils"
import { TokenCard } from "../../Components/Tokens/TokenCard"

const ItemSeparator = () => <BaseSpacer height={8} />

export const TokensTopSection = () => {
    const { data: nonVechainTokenWithBalances } = useNonVechainTokensBalance()
    const { B3TR, VOT3 } = useAppSelector(selectNetworkVBDTokens)
    const vechainTokens = useMemo(() => {
        return [VET.address, VTHO.address, B3TR.address, VOT3.address]
    }, [B3TR.address, VOT3.address])

    const { data: vechainTokenBalances } = useMultipleTokensBalance(vechainTokens)

    const vechainTokenWithBalances = useMemo(() => {
        if (!vechainTokenBalances) return []
        return [VET, VTHO, B3TR, VOT3].map((tk, idx) => ({ ...tk, balance: vechainTokenBalances?.[idx] }))
    }, [B3TR, VOT3, vechainTokenBalances])

    const tokenBalances = useMemo(
        () => vechainTokenWithBalances.concat(nonVechainTokenWithBalances).filter(tb => !tb.balance.isHidden),
        [nonVechainTokenWithBalances, vechainTokenWithBalances],
    )

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
    }, [B3TR.address, B3TR.decimals, B3TR.desc, B3TR.icon, B3TR.name, B3TR.symbol, VOT3.symbol, tokenBalances])

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
