import React, { useCallback } from "react"
import { BaseView, BaseText, BaseSpacer } from "~Components"
import { useI18nContext } from "~i18n"
import { useNewDApps } from "~Hooks"
import { DAppCard } from "./DAppCard"
import { FlatList, ListRenderItemInfo } from "react-native"
import { DiscoveryDApp } from "~Constants"
import { DAppsLoadingSkeleton } from "./DAppsLoadingSkeleton"
import { useDAppActions } from "../Hooks"

export const NewDapps = () => {
    const { LL } = useI18nContext()
    const { isLoading, newDapps } = useNewDApps()
    const { onDAppPress } = useDAppActions()

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
