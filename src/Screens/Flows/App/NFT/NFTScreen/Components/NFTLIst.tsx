import { StyleSheet, FlatList } from "react-native"
import React, { memo, useCallback } from "react"
import { usePlatformBottomInsets, useThemedStyles } from "~Hooks"
import { BaseSpacer } from "~Components"
import { NFTView } from "../../Components"
import { NonFungibleTokenCollection } from "~Model"
import { ListFooterView } from "./ListFooterView"
import { MathUtils } from "~Utils"

type NFTListProps = {
    item: NonFungibleTokenCollection
    index: number
}

type Props = {
    collections: NonFungibleTokenCollection[]
    isLoading: boolean
    onGoToBlackListed: () => void
    fetchMoreCollections: () => void
    onMomentumScrollBegin: () => void
    hasNext: boolean
}

export const NFTLIst = memo(
    ({
        collections,
        fetchMoreCollections,
        isLoading,
        onGoToBlackListed,
        onMomentumScrollBegin,
        hasNext,
    }: Props) => {
        const { calculateBottomInsets } = usePlatformBottomInsets()

        const { styles } = useThemedStyles(baseStyles(calculateBottomInsets))

        const renderSeparator = useCallback(
            () => <BaseSpacer height={16} />,
            [],
        )

        const renderNftCollection = useCallback(
            ({ item, index }: NFTListProps) => {
                return <NFTView item={item} index={index} isCollection />
            },
            [],
        )

        return (
            <FlatList
                data={collections}
                extraData={collections}
                contentContainerStyle={styles.listContainer}
                numColumns={2}
                keyExtractor={item => String(item.address)}
                ItemSeparatorComponent={renderSeparator}
                renderItem={renderNftCollection}
                onScroll={onMomentumScrollBegin}
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
                onEndReachedThreshold={0.1}
                onEndReached={fetchMoreCollections}
                ListHeaderComponentStyle={styles.listheader}
                ListFooterComponentStyle={styles.listFooter}
                ListFooterComponent={
                    <ListFooterView
                        onGoToBlackListed={onGoToBlackListed}
                        isLoading={isLoading}
                        hasNext={hasNext}
                        renderExtraSkeleton={MathUtils.getOdd(
                            collections.length,
                        )}
                    />
                }
            />
        )
    },
)

const baseStyles = (calculateBottomInsets: number) => () =>
    StyleSheet.create({
        listContainer: {
            marginHorizontal: 20,
            paddingTop: 24,
            paddingBottom: calculateBottomInsets,
        },
        listheader: {
            marginBottom: 24,
        },
        listFooter: { zIndex: -1 },
    })
