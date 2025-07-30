import React, { forwardRef, useCallback, useMemo, useState } from "react"
import { FlatList, ListRenderItemInfo, StyleSheet } from "react-native"
import { BaseBottomSheet, BaseChip, BaseIcon, BaseSpacer, BaseText, BaseView } from "~Components"
import { Spinner } from "~Components/Reusable/Spinner"
import { COLORS, DiscoveryDApp } from "~Constants"
import { DAppType } from "~Model"
import { useDappsWithPagination, UseDappsWithPaginationSortKey } from "~Hooks/useDappsWithPagination"
import { useI18nContext } from "~i18n"
import { useTheme } from "~Hooks"
import { X2EAppWithDetails } from "./X2EAppWithDetails"
import { X2EAppDetails } from "./X2EAppDetails"
import { SortableKeys } from "../../DiscoverScreen/Components/Bottomsheets"
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"

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
    onFetchNextPage: () => void
    isLoading: boolean
}

const LoadingMoreFooter = ({ isLoading }: { isLoading: boolean }) => {
    const { LL } = useI18nContext()

    if (isLoading)
        return (
            <BaseView gap={8} alignItems="center" justifyContent="center" flexDirection="row" w={100} py={8} mt={20}>
                <Spinner />
                <BaseText typographyFont="bodySemiBold">{LL.LOADING_MORE()}</BaseText>
            </BaseView>
        )

    return <BaseSpacer height={0} />
}

const X2EAppItem = ({ dapp }: { dapp: DiscoveryDApp }) => {
    return (
        <X2EAppWithDetails
            name={dapp.name}
            icon={dapp.iconUri || `${process.env.REACT_APP_GOOGLE_FAVICON_URL}${dapp.href}`}
            desc={dapp.desc}>
            <X2EAppDetails.Container>
                <X2EAppDetails.Description>
                    {dapp.desc || "Discover this exciting DApp from the VeChain ecosystem."}
                </X2EAppDetails.Description>
                <X2EAppDetails.Stats />
                <BaseSpacer height={18} />
                <X2EAppDetails.Actions />
            </X2EAppDetails.Container>
        </X2EAppWithDetails>
    )
}

const X2EAppsList = ({ dapps, onFetchNextPage, isLoading }: DAppsListProps) => {
    const renderItem = useCallback(({ item }: ListRenderItemInfo<DiscoveryDApp>) => {
        return <X2EAppItem dapp={item} />
    }, [])

    const renderItemSeparator = useCallback(() => {
        return <BaseSpacer height={24} />
    }, [])

    const renderListFooter = useCallback(() => {
        return <LoadingMoreFooter isLoading={isLoading} />
    }, [isLoading])

    const renderSkeletonItem = useCallback(() => {
        return <BaseView bg={COLORS.GREY_200} h={100} borderRadius={12} />
    }, [])

    if (isLoading && dapps.length === 0) {
        return (
            <FlatList
                renderItem={renderSkeletonItem}
                data={[1, 2, 3, 4, 5]}
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

type X2EAppsBottomSheetProps = {
    onDismiss?: () => void
    sortedBy?: SortableKeys
    onSortChange?: (sort: SortableKeys) => void
}

export const X2EAppsBottomSheet = forwardRef<BottomSheetModalMethods, X2EAppsBottomSheetProps>(
    ({ onDismiss, sortedBy = "asc" }, ref) => {
        const { LL } = useI18nContext()
        const theme = useTheme()

        const [selectedDappsType, setSelectedDappsType] = useState(DAppType.ALL)

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
        } = useDappsWithPagination({
            sort: vbdSort,
            filter: selectedDappsType,
        })

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
            <BaseBottomSheet
                snapPoints={["90%"]}
                ref={ref}
                onDismiss={onDismiss}
                floating={false}
                backgroundStyle={{ backgroundColor: theme.colors.card }}>
                <BaseView pb={16} gap={32}>
                    <BaseView flexDirection="row" gap={16}>
                        <BaseIcon name="icon-salad" size={32} color={theme.colors.editSpeedBs.title} />
                        <BaseText typographyFont="biggerTitleSemiBold" color={theme.colors.editSpeedBs.title}>
                            {LL.COMMON_DAPPS()}
                        </BaseText>
                    </BaseView>
                    <TopFilters filters={filterOptions} />
                    <X2EAppsList dapps={dappsToShow || []} isLoading={isLoading} onFetchNextPage={onFetchNextPage} />
                </BaseView>
            </BaseBottomSheet>
        )
    },
)
