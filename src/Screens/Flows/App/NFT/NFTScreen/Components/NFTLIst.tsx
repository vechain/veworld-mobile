import { StyleSheet, FlatList } from "react-native"
import React, { memo, useCallback, useMemo } from "react"
import { usePlatformBottomInsets, useThemedStyles } from "~Common"
import { BaseIcon, BaseSpacer, FastActionsBar } from "~Components"
import { NFTView } from "../../Components"
import { FastAction, NonFungibleTokenCollection } from "~Model"
import { useI18nContext } from "~i18n"
import { ListFooterView } from "./ListFooterView"

type NFTListProps = {
    item: NonFungibleTokenCollection
    index: number
}

type Props = {
    collections: NonFungibleTokenCollection[]
    isLoading: boolean
    onGoToBlackListed: () => void
    fetchMoreCollections: () => void
}

export const NFTLIst = memo(
    ({
        collections,
        fetchMoreCollections,
        isLoading,
        onGoToBlackListed,
    }: Props) => {
        const { calculateBottomInsets } = usePlatformBottomInsets()

        const { LL } = useI18nContext()

        const { styles, theme } = useThemedStyles(
            baseStyles(calculateBottomInsets),
        )

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

        const Actions: FastAction[] = useMemo(
            () => [
                {
                    name: LL.COMMON_IMPORT(),
                    action: () => {},
                    icon: (
                        <BaseIcon
                            color={theme.colors.text}
                            name="tray-arrow-up"
                        />
                    ),
                    testID: "importButton",
                },
                {
                    name: LL.BTN_SEND(),
                    action: () => {},
                    icon: (
                        <BaseIcon
                            color={theme.colors.text}
                            name="send-outline"
                        />
                    ),
                    testID: "sendButton",
                },
                {
                    name: LL.COMMON_RECEIVE(),
                    action: () => {},
                    icon: (
                        <BaseIcon color={theme.colors.text} name="arrow-down" />
                    ),
                    testID: "receiveButton",
                },
            ],
            [LL, theme.colors.text],
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
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
                onEndReachedThreshold={1}
                onEndReached={fetchMoreCollections}
                ListHeaderComponent={<FastActionsBar actions={Actions} />}
                ListHeaderComponentStyle={styles.listheader}
                ListFooterComponent={
                    <ListFooterView
                        onGoToBlackListed={onGoToBlackListed}
                        isLoading={isLoading}
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
    })
