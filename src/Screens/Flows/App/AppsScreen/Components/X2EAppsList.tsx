import React, { useCallback } from "react"
import { ListRenderItemInfo } from "react-native"
import { BottomSheetFlatList } from "@gorhom/bottom-sheet"
import { BaseSpacer } from "~Components"
import { VeBetterDaoDapp, VeBetterDaoDAppMetadata } from "~Model"
import { X2EAppItem } from "./X2EAppItem"
import { X2EAppSkeleton } from "./X2EAppSkeleton"

type X2EDapp = VeBetterDaoDapp & VeBetterDaoDAppMetadata

type X2EAppsListProps = {
    apps: X2EDapp[]
    isLoading: boolean
    onDismiss?: () => void
    openItemId: string | null
    onToggleOpenItem: (itemId: string) => void
}

const styles = {
    flatListPadding: { paddingBottom: 24, paddingTop: 32, paddingHorizontal: 24 },
}

export const X2EAppsList = React.memo(
    ({ apps, isLoading, onDismiss, openItemId, onToggleOpenItem }: X2EAppsListProps) => {
        const renderItem = useCallback(
            ({ item }: ListRenderItemInfo<X2EDapp>) => {
                return (
                    <X2EAppItem
                        dapp={item}
                        onDismiss={onDismiss}
                        openItemId={openItemId}
                        onToggleOpenItem={onToggleOpenItem}
                    />
                )
            },
            [onDismiss, openItemId, onToggleOpenItem],
        )

        const renderSkeletonItem = useCallback(() => {
            return <X2EAppSkeleton />
        }, [])

        const renderItemSeparator = useCallback(() => {
            return <BaseSpacer height={24} />
        }, [])

        const keyExtractor = useCallback((item: X2EDapp) => item.id, [])

        if (isLoading) {
            return (
                <BottomSheetFlatList
                    data={[1, 2, 3, 4, 5, 6]}
                    keyExtractor={item => item.toString()}
                    renderItem={renderSkeletonItem}
                    ItemSeparatorComponent={renderItemSeparator}
                    scrollEnabled={false}
                    contentContainerStyle={styles.flatListPadding}
                />
            )
        }

        return (
            <BottomSheetFlatList
                data={apps}
                keyExtractor={keyExtractor}
                renderItem={renderItem}
                ItemSeparatorComponent={renderItemSeparator}
                onEndReachedThreshold={0.5}
                contentContainerStyle={styles.flatListPadding}
            />
        )
    },
)
