import React, { useCallback } from "react"
import { BaseSafeArea, BaseSpacer, BaseView } from "~Components"
import { NftScreenHeader } from "./components"
import { selectNftCollections, useAppSelector } from "~Storage/Redux"
import { NonFungibleTokenCollection } from "~Model"
import { isEmpty } from "lodash"
import { NftSkeleton } from "./components/NftSkeleton"
import { StyleSheet, FlatList } from "react-native"
import { usePlatformBottomInsets, useThemedStyles } from "~Common"
import { NFTView } from "../Components"

type NFTListProps = {
    item: NonFungibleTokenCollection
    index: number
}

export const NFTScreen = () => {
    const { calculateBottomInsets } = usePlatformBottomInsets()
    const nftCollections = useAppSelector(selectNftCollections)

    const { styles } = useThemedStyles(baseStyles(calculateBottomInsets))

    const renderSeparator = useCallback(() => <BaseSpacer height={16} />, [])

    const renderNftCollection = useCallback(({ item, index }: NFTListProps) => {
        const collectionWithMissingNftData = item.nfts.filter(
            nft => !isEmpty(nft.image),
        )

        if (collectionWithMissingNftData.length) {
            return <NFTView item={item} index={index} isCollection />
        } else {
            return null
        }
    }, [])

    return (
        <BaseSafeArea grow={1} testID="NFT_Screen">
            <NftScreenHeader />

            <BaseView flex={1} mx={20} justifyContent="center">
                {!isEmpty(nftCollections) ? (
                    <FlatList
                        data={nftCollections}
                        contentContainerStyle={styles.listContainer}
                        numColumns={2}
                        keyExtractor={item => String(item.address)}
                        ItemSeparatorComponent={renderSeparator}
                        renderItem={renderNftCollection}
                        showsVerticalScrollIndicator={false}
                        showsHorizontalScrollIndicator={false}
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
