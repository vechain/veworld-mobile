import { useScrollToTop } from "@react-navigation/native"
import React, { useCallback, useMemo, useRef, useState } from "react"
import { FlatList, ListRenderItemInfo, StyleSheet } from "react-native"
import { BaseIcon, BaseSpacer, BaseText, BaseTouchable, BaseView, useNotifications } from "~Components"
import { DiscoveryDApp } from "~Constants"
import { useI18nContext } from "~i18n"
import { DAppType } from "~Model"
import { DAppCard } from "./DAppCard"

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
        <BaseView flexDirection="row" justifyContent="space-evenly">
            {filters.map(({ key, isSelected, title, onPress }) => (
                <BaseTouchable key={key} underlined={isSelected} font="bodyBold" title={title} action={onPress} />
            ))}
        </BaseView>
    )
}

type DAppsGridProps = {
    dapps: DiscoveryDApp[]
    onDAppPress: ({ href, custom }: { href: string; custom?: boolean }) => void
}

const DAppsGrid = ({ dapps, onDAppPress }: DAppsGridProps) => {
    const flatListRef = useRef(null)
    const { increaseDappCounter } = useNotifications()
    useScrollToTop(flatListRef)
    const columns = 4
    const columnsGap = 24

    const renderItem = useCallback(
        ({ item, index }: ListRenderItemInfo<DiscoveryDApp>) => {
            const isLast = index === dapps.length - 1

            return (
                <BaseView
                    pl={columnsGap}
                    pr={isLast ? columnsGap : 0}
                    justifyContent="flex-start"
                    alignItems="flex-start">
                    <DAppCard
                        columns={columns}
                        columnsGap={24}
                        dapp={item}
                        onPress={() => {
                            if (item.veBetterDaoId) {
                                increaseDappCounter(item.veBetterDaoId)
                            }
                            onDAppPress({ href: item.href })
                        }}
                    />
                </BaseView>
            )
        },
        [dapps.length, increaseDappCounter, onDAppPress],
    )

    return (
        <FlatList
            ref={flatListRef}
            data={dapps}
            scrollEnabled={true}
            keyExtractor={item => item.href}
            contentContainerStyle={styles.flatListPadding}
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
    onDAppPress: ({ href, custom }: { href: string; custom?: boolean }) => void
}

export const Ecosystem = React.memo(({ title, dapps, onDAppPress }: EcosystemProps) => {
    const { LL } = useI18nContext()
    const [selectedDappsType, setSelectedDappsType] = useState(DAppType.ALL)

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
        const dappsWithLowercaseTags = dapps.map(dapp => ({
            ...dapp,
            tags: dapp.tags?.map(tag => tag.toLowerCase()),
        }))

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
                return dapps
        }
    }, [dapps, selectedDappsType])

    return (
        <BaseView>
            <BaseView flexDirection={"row"} justifyContent="space-between" px={20}>
                <BaseText typographyFont="bodySemiBold">{title}</BaseText>
                <BaseTouchable>
                    <BaseIcon name="icon-sort-desc" size={20} />
                </BaseTouchable>
            </BaseView>
            <BaseSpacer height={24} />
            <TopFilters filters={filterOptions} />
            <BaseSpacer height={24} />
            <DAppsGrid dapps={dappsToShow} onDAppPress={onDAppPress} />
        </BaseView>
    )
})
