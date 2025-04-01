import React, { useCallback } from "react"
import { BaseView, BaseText, BaseSpacer, useNotifications } from "~Components"
import { FlatList, ListRenderItemInfo } from "react-native"
import { useI18nContext } from "~i18n"
import { useAnalyticTracking, useTrendingDApps } from "~Hooks"
import { DAppCard } from "./DAppCard"
import { AnalyticsEvent, DiscoveryDApp } from "~Constants"
import { useNavigation } from "@react-navigation/native"
import { Routes } from "~Navigation"
import { addNavigationToDApp, useAppDispatch } from "~Storage/Redux"
import { DAppsLoadingSkeleton } from "./DAppsLoadingSkeleton"

export const PopularTrendingDApps = () => {
    const { LL } = useI18nContext()
    const nav = useNavigation()
    const track = useAnalyticTracking()
    const dispatch = useAppDispatch()
    const { isLoading, trendingDapps } = useTrendingDApps()
    const { increaseDappCounter } = useNotifications()

    const renderItem = useCallback(
        ({ item, index }: ListRenderItemInfo<DiscoveryDApp>) => {
            const isLast = index === trendingDapps.length - 1
            const columnsGap = 16

            const onPress = () => {
                nav.navigate(Routes.BROWSER, { url: item.href })
                track(AnalyticsEvent.DISCOVERY_USER_OPENED_DAPP, {
                    url: item.href,
                })

                if (item.id) {
                    increaseDappCounter(item.id)
                }

                setTimeout(() => {
                    dispatch(addNavigationToDApp({ href: item.href, isCustom: item.isCustom ?? false }))
                }, 1000)
            }

            return (
                <BaseView pl={columnsGap} pr={isLast ? columnsGap : 0} justifyContent="center" alignItems="center">
                    <DAppCard dapp={item} onPress={onPress} />
                </BaseView>
            )
        },
        [trendingDapps.length, nav, track, dispatch, increaseDappCounter],
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
