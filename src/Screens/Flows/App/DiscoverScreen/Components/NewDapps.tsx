import React, { useCallback } from "react"
import { BaseView, BaseText } from "~Components"
import { useI18nContext } from "~i18n"
import { useNewDApps } from "~Hooks"
import { DAppCard } from "./DAppCard"
import { FlatList, ListRenderItemInfo } from "react-native"
import { DiscoveryDApp } from "~Constants"

export const NewDapps = () => {
    const { LL } = useI18nContext()
    const newDapps = useNewDApps()

    const renderItem = useCallback(
        ({ item, index }: ListRenderItemInfo<DiscoveryDApp>) => {
            const isLast = index === newDapps.length - 1
            const columnsGap = 16

            return (
                <BaseView pl={columnsGap} pr={isLast ? columnsGap : 0} justifyContent="center" alignItems="center">
                    <DAppCard dapp={item} onPress={() => {}} />
                </BaseView>
            )
        },
        [newDapps.length],
    )

    return (
        <BaseView py={24}>
            <BaseView flexDirection="row" justifyContent="space-between" px={16}>
                <BaseText typographyFont="bodySemiBold">{LL.DISCOVER_TAB_NEW_DAPPS()}</BaseText>
            </BaseView>

            <FlatList data={newDapps} horizontal showsHorizontalScrollIndicator={false} renderItem={renderItem} />
        </BaseView>
    )
}
