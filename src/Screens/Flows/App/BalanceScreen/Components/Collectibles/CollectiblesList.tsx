import { useNavigation } from "@react-navigation/native"
import React, { useCallback, useMemo } from "react"
import { FlatList, ListRenderItemInfo, StyleSheet } from "react-native"
import { BaseButton, BaseIcon, BaseSpacer } from "~Components"
import { CollectibleBottomSheet } from "~Components/Collectibles/CollectibleBottomSheet"
import { useBottomSheetModal, useThemedStyles } from "~Hooks"
import { useHomeCollectibles } from "~Hooks/useHomeCollectibles"
import { useI18nContext } from "~i18n"
import { Routes } from "~Navigation"
import { selectAllFavoriteNfts, useAppSelector } from "~Storage/Redux"
import { AddressUtils } from "~Utils"
import { CollectibleCard } from "./CollectibleCard"
import { CollectiblesEmptyCard } from "./CollectiblesEmptyCard"

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

export const CollectiblesList = () => {
    const { styles } = useThemedStyles(baseStyles)
    const favoriteNfts = useAppSelector(selectAllFavoriteNfts)
    const { data: allNfts } = useHomeCollectibles()
    const { ref, onOpen } = useBottomSheetModal()

    const nfts = useMemo(() => {
        return (
            favoriteNfts
                .sort((a, b) => b.createdAt - a.createdAt)
                .map(({ createdAt: _createdAt, ...rest }) => rest)
                .concat(allNfts?.data.map(nft => ({ address: nft.contractAddress, tokenId: nft.tokenId })) ?? [])
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
                .slice(0, 4)
        )
    }, [allNfts?.data, favoriteNfts])

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
                testID="VBD_COLLECTIBLES_LIST"
                renderItem={renderItem}
                data={nfts}
                numColumns={2}
                ItemSeparatorComponent={ItemSeparatorComponent}
                ListEmptyComponent={CollectiblesEmptyCard}
                horizontal={false}
                keyExtractor={v => `${v.address}_${v.tokenId}`}
                columnWrapperStyle={styles.listColumn}
                ListFooterComponent={<ListFooterComponent addresses={addresses} />}
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
