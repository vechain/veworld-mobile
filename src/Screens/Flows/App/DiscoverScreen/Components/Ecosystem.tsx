import { useScrollToTop, useTheme } from "@react-navigation/native"
import { default as React, useCallback, useMemo, useRef, useState } from "react"
import { FlatList, ListRenderItemInfo, StyleSheet } from "react-native"
import { BaseChip, BaseIcon, BaseSpacer, BaseText, BaseTouchable, BaseView } from "~Components"
import { Spinner } from "~Components/Reusable/Spinner"
import { DiscoveryDApp } from "~Constants"
import { useBottomSheetModal } from "~Hooks"
import { useDappsWithPagination, UseDappsWithPaginationSortKey } from "~Hooks/useDappsWithPagination"
import { useI18nContext } from "~i18n"
import { DAppType } from "~Model"
import { useDAppActions } from "../Hooks"
import { DAppOptionsBottomSheet, SortableKeys, SortDAppsBottomSheet } from "./Bottomsheets"
import { DAppHorizontalCard } from "./DAppHorizontalCard"
import { DappHorizontalCardSkeleton } from "./DappHorizontalCardSkeleton"

type Filter = {
    key: DAppType
    title: string
    isSelected: boolean
    onPress: () => void
}

type TopFiltersProps = {
    filters: Filter[]
}

const TopFilters = ({ filters }: TopFiltersProps) => {
    return (
        <BaseView flexDirection="row" justifyContent="space-between">
            {filters.map(({ key, isSelected, title, onPress }) => (
                <BaseChip key={key} label={title} active={isSelected} onPress={onPress} />
            ))}
        </BaseView>
    )
}

type DAppsListProps = {
    dapps: DiscoveryDApp[]
    onOpenDApp: (dapp: DiscoveryDApp) => void
    onMorePress: (dapp: DiscoveryDApp) => void
    onFetchNextPage: () => void
    isLoading: boolean
}

const DAppsList = ({ dapps, onMorePress, onOpenDApp, onFetchNextPage, isLoading }: DAppsListProps) => {
    const { LL } = useI18nContext()
    const flatListRef = useRef(null)
    useScrollToTop(flatListRef)

    const renderItem = useCallback(
        ({ item }: ListRenderItemInfo<DiscoveryDApp>) => {
            return (
                <DAppHorizontalCard
                    dapp={item}
                    onOpenDApp={onOpenDApp}
                    onPress={() => {
                        onMorePress(item)
                    }}
                />
            )
        },
        [onMorePress, onOpenDApp],
    )

    const renderItemSeparator = useCallback(() => {
        return <BaseSpacer height={16} />
    }, [])

    const renderListFooter = useCallback(() => {
        return isLoading && dapps.length > 0 ? (
            <BaseView gap={8} alignItems="center" justifyContent="center" flexDirection="row" w={100} py={8} mt={20}>
                <Spinner />
                <BaseText typographyFont="bodySemiBold">{LL.LOADING_MORE()}</BaseText>
            </BaseView>
        ) : (
            <BaseSpacer height={0} />
        )
    }, [LL, dapps.length, isLoading])

    const renderSkeletonItem = useCallback(() => {
        return <DappHorizontalCardSkeleton />
    }, [])

    if (isLoading && dapps.length === 0) {
        return (
            <FlatList
                renderItem={renderSkeletonItem}
                data={[1, 2, 3, 4, 5, 6, 7]}
                keyExtractor={item => item.toString()}
                scrollEnabled={false}
                shouldRasterizeIOS
                ItemSeparatorComponent={renderItemSeparator}
                contentContainerStyle={styles.flatListPadding}
            />
        )
    }

    return (
        <FlatList
            ref={flatListRef}
            data={dapps}
            scrollEnabled={true}
            keyExtractor={item => item.href}
            contentContainerStyle={styles.flatListPadding}
            ItemSeparatorComponent={renderItemSeparator}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            renderItem={renderItem}
            onEndReached={onFetchNextPage}
            ListFooterComponent={renderListFooter}
            onEndReachedThreshold={0.5}
        />
    )
}

const styles = StyleSheet.create({
    flatListPadding: { paddingBottom: 24 },
})

type EcosystemProps = {
    title: string
}

export const Ecosystem = React.memo(({ title }: EcosystemProps) => {
    const { LL } = useI18nContext()
    const theme = useTheme()

    const { onDAppPress } = useDAppActions()

    const [selectedDappsType, setSelectedDappsType] = useState(DAppType.ALL)
    const [selectedDApp, setSelectedDApp] = useState<DiscoveryDApp | undefined>(undefined)
    const [sortedBy, setSortedBy] = useState<SortableKeys>("asc")

    const { ref: dappOptionsRef, onOpen: onOpenDAppOptions, onClose: onCloseDAppOptions } = useBottomSheetModal()
    const {
        ref: sortBottomSheetRef,
        onOpen: onOpenSortBottomSheet,
        onClose: onCloseSortBottomSheet,
    } = useBottomSheetModal()

    const vbdSort = useMemo<UseDappsWithPaginationSortKey>(() => {
        switch (sortedBy) {
            case "asc":
                return "alphabetic_asc"
            case "desc":
                return "alphabetic_desc"
            case "newest":
                return "newest"
        }
    }, [sortedBy])

    const {
        data: dappsToShow,
        fetchNextPage,
        isLoading,
    } = useDappsWithPagination({ sort: vbdSort, filter: selectedDappsType })

    const onMorePress = useCallback(
        (dapp: DiscoveryDApp) => {
            setSelectedDApp(dapp)
            onOpenDAppOptions()
        },
        [onOpenDAppOptions],
    )

    const onDAppModalClose = useCallback(() => {
        setSelectedDApp(undefined)
        onCloseDAppOptions()
    }, [onCloseDAppOptions])

    const filterOptions = useMemo(() => {
        const _all = DAppType.ALL
        const _sustainability = DAppType.SUSTAINABILTY
        const _nft = DAppType.NFT
        const _dapps = DAppType.DAPPS

        return [
            {
                key: _all,
                title: LL.DISCOVER_ECOSYSTEM_FILTER_ALL(),
                isSelected: selectedDappsType === _all,
                onPress: () => setSelectedDappsType(_all),
            },
            {
                key: _sustainability,
                title: LL.DISCOVER_ECOSYSTEM_FILTER_SUSTAINABILITY(),
                isSelected: selectedDappsType === _sustainability,
                onPress: () => setSelectedDappsType(_sustainability),
            },
            {
                key: _nft,
                title: LL.DISCOVER_ECOSYSTEM_FILTER_NFTS(),
                isSelected: selectedDappsType === _nft,
                onPress: () => setSelectedDappsType(_nft),
            },
            {
                key: _dapps,
                title: LL.DISCOVER_ECOSYSTEM_FILTER_DAPPS(),
                isSelected: selectedDappsType === _dapps,
                onPress: () => setSelectedDappsType(_dapps),
            },
        ]
    }, [LL, selectedDappsType])

    const onFetchNextPage = useCallback(async () => {
        fetchNextPage()
    }, [fetchNextPage])

    return (
        <BaseView px={16}>
            <BaseView flexDirection={"row"} justifyContent="space-between">
                <BaseText typographyFont="bodySemiBold">{title}</BaseText>
                <BaseTouchable onPress={onOpenSortBottomSheet}>
                    <BaseIcon name="icon-sort-desc" size={20} color={theme.colors.text} />
                </BaseTouchable>
            </BaseView>
            <BaseSpacer height={24} />
            <TopFilters filters={filterOptions} />
            <BaseSpacer height={24} />
            <DAppsList
                dapps={dappsToShow || []}
                onMorePress={onMorePress}
                onOpenDApp={onDAppPress}
                isLoading={isLoading}
                onFetchNextPage={onFetchNextPage}
            />
            <DAppOptionsBottomSheet ref={dappOptionsRef} selectedDApp={selectedDApp} onClose={onDAppModalClose} />
            <SortDAppsBottomSheet
                ref={sortBottomSheetRef}
                sortedBy={sortedBy}
                onSortChange={sort => {
                    setSortedBy(sort)
                    onCloseSortBottomSheet()
                }}
            />
        </BaseView>
    )
})
