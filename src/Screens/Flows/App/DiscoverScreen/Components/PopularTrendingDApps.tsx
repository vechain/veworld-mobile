import React, { useCallback } from "react"
import { BaseView, BaseText, BaseSpacer } from "~Components"
import { FlatList, ListRenderItemInfo } from "react-native"
import { useI18nContext } from "~i18n"
import { useTrendingDApps } from "~Hooks"
import { DAppCard } from "./DAppCard"
import { DiscoveryDApp } from "~Constants"
import { DAppsLoadingSkeleton } from "./DAppsLoadingSkeleton"
import { useDAppActions } from "../Hooks"

export const PopularTrendingDApps = () => {
    const { LL } = useI18nContext()
    const { isLoading, trendingDapps } = useTrendingDApps()
    const { onDAppPress } = useDAppActions()

    const renderItem = useCallback(
        ({ item, index }: ListRenderItemInfo<DiscoveryDApp>) => {
            const isLast = index === trendingDapps.length - 1
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
        [onDAppPress, trendingDapps.length],
    )

    return (
        <BaseView>
            <BaseView flexDirection="row" justifyContent="space-between" px={16}>
                <BaseText typographyFont="bodySemiBold">{LL.DISCOVER_TAB_TRENDING_AND_POPULAR()}</BaseText>
            </BaseView>
            <BaseSpacer height={16} />

            {isLoading ? (
                <DAppsLoadingSkeleton />
            ) : (
                <FlatList
                    data={trendingDapps}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    renderItem={renderItem}
                />
            )}
        </BaseView>
    )
}
