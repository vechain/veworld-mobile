import { useNavigation } from "@react-navigation/native"
import React, { useCallback } from "react"
import { FlatList, ListRenderItemInfo } from "react-native"
import { BaseSpacer, BaseText, BaseView } from "~Components"
import { COLORS } from "~Constants"
import { useTheme } from "~Hooks"
import { useI18nContext } from "~i18n"
import { Activity, FungibleToken, TransactionOutcomes } from "~Model"
import { Routes } from "~Navigation"
import { ActivityItemRenderer } from "~Screens/Flows/App/ActivityScreen/Components/ActivityItemRenderer"
import { SkeletonActivity } from "../../Components/Activity/SkeletonActivity"
import { useActivityTimestampRenderer } from "../../Hooks/useActivityTimestampRenderer"
import { useBalanceActivities } from "../../Hooks/useBalanceActivities"
import { BalanceTab } from "../types"

const ItemSeparatorComponent = () => <BaseSpacer height={8} />

const LOADING_ITEMS = [{ id: "1" }, { id: "2" }, { id: "3" }, { id: "4" }]

export const BalanceActivity = ({ tab }: { tab: BalanceTab }) => {
    const { LL } = useI18nContext()
    const theme = useTheme()
    const nav = useNavigation()

    const timestampRenderer = useActivityTimestampRenderer()

    const { data, isLoading } = useBalanceActivities({ tab })

    const onActivityPress = useCallback(
        (activity: Activity, token?: FungibleToken, isSwap?: boolean, decodedClauses?: TransactionOutcomes) => {
            nav.navigate(Routes.ACTIVITY_DETAILS, {
                activity,
                token,
                isSwap,
                decodedClauses,
                returnScreen: Routes.HOME,
            })
        },
        [nav],
    )

    const renderItem = useCallback(
        ({ item }: ListRenderItemInfo<Activity>) => {
            return (
                <ActivityItemRenderer activity={item} onPress={onActivityPress} timestampRenderer={timestampRenderer} />
            )
        },
        [onActivityPress, timestampRenderer],
    )

    const renderLoadingItem = useCallback(() => {
        return <SkeletonActivity />
    }, [])

    if (!isLoading && data?.length === 0) return null

    return (
        <BaseView flexDirection="column" gap={16}>
            <BaseText typographyFont="subSubTitleSemiBold" color={theme.isDark ? COLORS.GREY_50 : COLORS.DARK_PURPLE}>
                {LL.ACTIVITY()}
            </BaseText>
            {isLoading ? (
                <FlatList
                    renderItem={renderLoadingItem}
                    data={LOADING_ITEMS}
                    ItemSeparatorComponent={ItemSeparatorComponent}
                    keyExtractor={item => item.id}
                />
            ) : (
                <FlatList
                    renderItem={renderItem}
                    data={data ?? []}
                    ItemSeparatorComponent={ItemSeparatorComponent}
                    keyExtractor={item => item.id}
                />
            )}
        </BaseView>
    )
}
