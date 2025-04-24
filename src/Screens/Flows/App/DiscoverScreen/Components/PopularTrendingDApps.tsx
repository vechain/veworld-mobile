import React, { useCallback, useMemo } from "react"
import { FlatList, ListRenderItemInfo } from "react-native"
import { BaseSpacer, BaseText, BaseView } from "~Components"
import { DiscoveryDApp } from "~Constants"
import { useTrendingDApps } from "~Hooks"
import { useI18nContext } from "~i18n"
import { useDAppActions } from "../Hooks"
import { DAppCard } from "./DAppCard"
import { DAppsLoadingSkeleton } from "./DAppsLoadingSkeleton"

export const PopularTrendingDApps = () => {
    const { LL } = useI18nContext()
    const { isLoading, trendingDapps } = useTrendingDApps()
    const { onDAppPress } = useDAppActions()

    const slicedData = useMemo(() => trendingDapps.slice(0, 10), [trendingDapps])

    const renderItem = useCallback(
        ({ item, index }: ListRenderItemInfo<DiscoveryDApp>) => {
            const isLast = index === slicedData.length - 1
            const columnsGap = 16

            const onPress = () => {
                onDAppPress(item)
            }

            return (
                <BaseView pl={columnsGap} pr={isLast ? columnsGap : 0} justifyContent="center" alignItems="center">
                    <DAppCard dapp={item} onPress={onPress} />
                </BaseView>
            )
        },
        [onDAppPress, slicedData.length],
    )

    return (
        <BaseView>
            <BaseView flexDirection="row" justifyContent="space-between" px={16}>
                <BaseText typographyFont="subSubTitleSemiBold">{LL.DISCOVER_TAB_TRENDING_AND_POPULAR()}</BaseText>
            </BaseView>
            <BaseSpacer height={16} />

            {isLoading ? (
                <DAppsLoadingSkeleton />
            ) : (
                <FlatList data={slicedData} horizontal showsHorizontalScrollIndicator={false} renderItem={renderItem} />
            )}
        </BaseView>
    )
}
