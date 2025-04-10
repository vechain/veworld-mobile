import { useScrollToTop, useTheme } from "@react-navigation/native"
import React, { useCallback, useMemo, useRef, useState } from "react"
import { FlatList, ListRenderItemInfo, StyleSheet } from "react-native"
import { BaseChip, BaseIcon, BaseSpacer, BaseText, BaseTouchable, BaseView } from "~Components"
import { DiscoveryDApp } from "~Constants"
import { useI18nContext } from "~i18n"
import { DAppType } from "~Model"
import { DAppHorizontalCard } from "./DAppHorizontalCard"
import { DAppOptionsBottomSheet, SortableKeys, SortDAppsBottomSheet } from "./Bottomsheets"
import { useBottomSheetModal } from "~Hooks"
import { useDAppActions } from "../Hooks"

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
}

const DAppsList = ({ dapps, onMorePress, onOpenDApp }: DAppsListProps) => {
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
        />
    )
}

const styles = StyleSheet.create({
    flatListPadding: { paddingBottom: 24 },
})

type EcosystemProps = {
    title: string
    dapps: DiscoveryDApp[]
}

export const Ecosystem = React.memo(({ title, dapps }: EcosystemProps) => {
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

    const dappsToShow = useMemo(() => {
        const sortDapps = (a: DiscoveryDApp, b: DiscoveryDApp) => {
            switch (sortedBy) {
                case "desc":
                    return b.name.localeCompare(a.name)
                case "newest":
                    return b.createAt - a.createAt
                case "asc":
                default:
                    return a.name.localeCompare(b.name)
            }
        }

        const dappsWithLowercaseTags = dapps
            .map(dapp => ({
                ...dapp,
                tags: dapp.tags?.map(tag => tag.toLowerCase()),
            }))
            .sort(sortDapps)

        switch (selectedDappsType) {
            case DAppType.SUSTAINABILTY:
                return dappsWithLowercaseTags.filter(dapp => dapp.tags?.includes(DAppType.SUSTAINABILTY.toLowerCase()))

            case DAppType.NFT:
                return dappsWithLowercaseTags.filter(dapp => dapp.tags?.includes(DAppType.NFT.toLowerCase()))

            case DAppType.DAPPS:
                return dappsWithLowercaseTags.filter(
                    dapp =>
                        !dapp.tags?.includes(DAppType.NFT.toLowerCase()) &&
                        !dapp.tags?.includes(DAppType.SUSTAINABILTY.toLowerCase()),
                )

            case DAppType.ALL:
            default:
                return dappsWithLowercaseTags
        }
    }, [dapps, selectedDappsType, sortedBy])

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
            <DAppsList dapps={dappsToShow} onMorePress={onMorePress} onOpenDApp={onDAppPress} />
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
