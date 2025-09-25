import React, { useCallback } from "react"
import { FlatList, ListRenderItemInfo } from "react-native"
import { BaseSpacer, BaseText, BaseView } from "~Components"
import { DiscoveryDApp } from "~Constants"
import { useNewDApps } from "~Hooks"
import { useI18nContext } from "~i18n"
import { Routes } from "~Navigation"
import { useDAppActions } from "../Hooks"
import { DAppCard } from "./DAppCard"
import { DAppsLoadingSkeleton } from "./DAppsLoadingSkeleton"

export const NewDapps = () => {
    const { LL } = useI18nContext()
    const { isLoading, newDapps } = useNewDApps()
    const { onDAppPress } = useDAppActions(Routes.DISCOVER)

    const renderItem = useCallback(
        ({ item, index }: ListRenderItemInfo<DiscoveryDApp>) => {
            const isLast = index === newDapps.length - 1
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
        [onDAppPress, newDapps.length],
    )

    return (
        <BaseView>
            <BaseView flexDirection="row" justifyContent="space-between" px={16}>
                <BaseText typographyFont="subSubTitleSemiBold">{LL.DISCOVER_TAB_RECENTLY_ADDED()}</BaseText>
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
