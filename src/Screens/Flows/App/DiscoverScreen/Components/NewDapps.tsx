import React, { useCallback } from "react"
import { BaseView, BaseText, BaseSpacer, useNotifications } from "~Components"
import { useI18nContext } from "~i18n"
import { useAnalyticTracking, useNewDApps } from "~Hooks"
import { DAppCard } from "./DAppCard"
import { FlatList, ListRenderItemInfo } from "react-native"
import { AnalyticsEvent, DiscoveryDApp } from "~Constants"
import { Routes } from "~Navigation"
import { useNavigation } from "@react-navigation/native"
import { addNavigationToDApp, useAppDispatch } from "~Storage/Redux"
import { DAppsLoadingSkeleton } from "./DAppsLoadingSkeleton"

export const NewDapps = () => {
    const { LL } = useI18nContext()
    const { isLoading, newDapps } = useNewDApps()
    const nav = useNavigation()
    const track = useAnalyticTracking()
    const dispatch = useAppDispatch()
    const { increaseDappCounter } = useNotifications()

    const renderItem = useCallback(
        ({ item, index }: ListRenderItemInfo<DiscoveryDApp>) => {
            const isLast = index === newDapps.length - 1
            const columnsGap = 16

            const onPress = () => {
                nav.navigate(Routes.BROWSER, { url: item.href })
                track(AnalyticsEvent.DISCOVERY_USER_OPENED_DAPP, {
                    url: item.href,
                })

                if (item.veBetterDaoId) {
                    increaseDappCounter(item.veBetterDaoId)
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
        [newDapps.length, nav, track, increaseDappCounter, dispatch],
    )

    return (
        <BaseView>
            <BaseView flexDirection="row" justifyContent="space-between" px={16}>
                <BaseText typographyFont="bodySemiBold">{LL.DISCOVER_TAB_NEW_DAPPS()}</BaseText>
            </BaseView>
            <BaseSpacer height={16} />

            {isLoading ? (
                <DAppsLoadingSkeleton />
            ) : (
                <FlatList data={newDapps} horizontal showsHorizontalScrollIndicator={false} renderItem={renderItem} />
            )}
        </BaseView>
    )
}
