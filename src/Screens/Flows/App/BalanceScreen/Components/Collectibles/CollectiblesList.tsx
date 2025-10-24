import { useNavigation } from "@react-navigation/native"
import React, { useCallback, useMemo } from "react"
import { FlatList, ListRenderItemInfo, StyleSheet } from "react-native"
import { BaseButton, BaseIcon, BaseSpacer } from "~Components"
import { CollectibleBottomSheet } from "~Components/Collectibles/CollectibleBottomSheet"
import { useBottomSheetModal, useThemedStyles } from "~Hooks"
import { useHomeCollectibles } from "~Hooks/useHomeCollectibles"
import { useI18nContext } from "~i18n"
import { Routes } from "~Navigation"
import { selectAllFavoriteNfts, selectSelectedAccount, selectSelectedNetwork, useAppSelector } from "~Storage/Redux"
import { AddressUtils } from "~Utils"
import { CollectibleCard } from "./CollectibleCard"
import { CollectiblesEmptyCard } from "./CollectiblesEmptyCard"
import { useQuery } from "@tanstack/react-query"
import { getNftsForContract } from "~Networking"

const ItemSeparatorComponent = () => <BaseSpacer height={8} />

const ListFooterComponent = ({ addresses }: { addresses: string[] }) => {
    const nav = useNavigation()
    const { LL } = useI18nContext()
    const { styles, theme } = useThemedStyles(footerStyles)

    const onNavigate = useCallback(() => {
        if (new Set(addresses).size === 1) {
            nav.navigate(Routes.COLLECTIBLES_COLLECTION_DETAILS, {
                collectionAddress: addresses[0],
            })
            return
        }
        nav.navigate(Routes.COLLECTIBLES_COLLECTIONS)
    }, [addresses, nav])

    if (addresses.length === 0) return null

    return (
        <BaseButton
            variant="ghost"
            px={0}
            py={4}
            action={onNavigate}
            typographyFont="bodyMedium"
            style={styles.btn}
            textColor={theme.colors.text}
            rightIcon={<BaseIcon name="icon-arrow-right" size={14} style={styles.icon} color={theme.colors.text} />}>
            {LL.ACTIVITY_SEE_ALL()}
        </BaseButton>
    )
}

const footerStyles = () =>
    StyleSheet.create({
        icon: {
            marginLeft: 2,
        },
        btn: {
            marginTop: 16,
        },
    })

type CollectiblesListProps = {
    collectionAddress?: string
}

export const CollectiblesList = ({ collectionAddress }: CollectiblesListProps) => {
    const { styles } = useThemedStyles(baseStyles)
    const favoriteNfts = useAppSelector(selectAllFavoriteNfts)
    const selectedNetwork = useAppSelector(selectSelectedNetwork)
    const selectedAccount = useAppSelector(selectSelectedAccount)
    const { data: allNfts } = useHomeCollectibles()
    const { ref, onOpen } = useBottomSheetModal()

    // Fetch NFTs for specific collection when collectionAddress is provided
    const { data: collectionNfts } = useQuery({
        queryKey: [
            "COLLECTIBLES",
            "COLLECTION_NFTS",
            collectionAddress,
            selectedNetwork.genesis.id,
            selectedAccount.address,
        ],
        queryFn: () => getNftsForContract(selectedNetwork.type, collectionAddress!, selectedAccount.address, 10, 0),
        enabled: !!collectionAddress,
        staleTime: 5 * 60 * 1000,
        gcTime: 5 * 60 * 1000,
    })

    const nfts = useMemo(() => {
        const filteredFavorites = collectionAddress
            ? favoriteNfts.filter(nft => AddressUtils.compareAddresses(nft.address, collectionAddress))
            : favoriteNfts

        const apiNfts = collectionAddress ? collectionNfts?.data ?? [] : allNfts?.data ?? []

        return (
            filteredFavorites
                .sort((a, b) => b.createdAt - a.createdAt)
                .map(({ createdAt: _createdAt, ...rest }) => rest)
                .concat(apiNfts.map(nft => ({ address: nft.contractAddress, tokenId: nft.tokenId })))
                //Deduplicate items
                .reduce((acc, curr) => {
                    if (
                        acc.find(
                            v => AddressUtils.compareAddresses(curr.address, v.address) && curr.tokenId === v.tokenId,
                        )
                    )
                        return acc
                    acc.push(curr)
                    return acc
                }, [] as { address: string; tokenId: string }[])
                .slice(0, collectionAddress ? undefined : 4)
        )
    }, [allNfts?.data, collectionNfts?.data, favoriteNfts, collectionAddress])

    const addresses = useMemo(() => nfts.map(nft => nft.address), [nfts])

    const onPress = useCallback(
        ({ address, tokenId }: { address: string; tokenId: string }) => {
            onOpen({ address, tokenId })
        },
        [onOpen],
    )

    const renderItem = useCallback(
        ({ item }: ListRenderItemInfo<{ address: string; tokenId: string }>) => {
            return <CollectibleCard address={item.address} tokenId={item.tokenId} onPress={onPress} />
        },
        [onPress],
    )

    return (
        <>
            <FlatList
                renderItem={renderItem}
                data={nfts}
                numColumns={2}
                ItemSeparatorComponent={ItemSeparatorComponent}
                ListEmptyComponent={CollectiblesEmptyCard}
                horizontal={false}
                keyExtractor={v => `${v.address}_${v.tokenId}`}
                columnWrapperStyle={styles.listColumn}
                ListFooterComponent={!collectionAddress ? <ListFooterComponent addresses={addresses} /> : null}
            />
            <CollectibleBottomSheet bsRef={ref} />
        </>
    )
}

const baseStyles = () =>
    StyleSheet.create({
        listColumn: {
            columnGap: 8,
        },
    })
