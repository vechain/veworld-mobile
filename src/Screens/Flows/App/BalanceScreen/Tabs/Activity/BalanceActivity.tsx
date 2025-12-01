import { useNavigation } from "@react-navigation/native"
import React, { useCallback, useMemo } from "react"
import { FlatList, ListRenderItemInfo } from "react-native"
import { BaseSpacer, BaseText, BaseView } from "~Components"
import { COLORS } from "~Constants"
import { useTheme } from "~Hooks"
import { useI18nContext } from "~i18n"
import { Activity, FungibleToken, TransactionOutcomes } from "~Model"
import { Routes } from "~Navigation"
import { ActivityItemRenderer } from "~Screens/Flows/App/ActivityScreen/Components/ActivityItemRenderer"
import { SkeletonActivity } from "../../Components/Activity/SkeletonActivity"
import { SeeAllButton } from "../../Components/SeeAllButton"
import { useActivityTimestampRenderer } from "../../Hooks/useActivityTimestampRenderer"
import { useBalanceActivities } from "../../Hooks/useBalanceActivities"
import { BalanceTab } from "../types"

const ItemSeparatorComponent = () => <BaseSpacer height={8} />
const ListFooterComponent = ({ tab }: { tab: BalanceTab }) => {
    const nav = useNavigation()
    const { LL } = useI18nContext()

    const tabRoute = useMemo(() => {
        if (tab === "TOKENS") {
            return Routes.ACTIVITY_B3TR
        }
        if (tab === "STAKING") {
            return Routes.ACTIVITY_STAKING
        }
        if (tab === "COLLECTIBLES") {
            return Routes.ACTIVITY_NFT
        }

        return Routes.ACTIVITY_ALL
    }, [tab])

    const onNavigate = useCallback(() => {
        nav.navigate(Routes.HISTORY_STACK, {
            screen: Routes.HISTORY,
            params: {
                screen: tabRoute,
            },
        })
    }, [nav, tabRoute])

    return <SeeAllButton action={onNavigate}>{LL.ACTIVITY_SEE_ALL()}</SeeAllButton>
}

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

    if (!isLoading && !data?.length) return null

    return (
        <>
            <BaseSpacer height={32} />
            <BaseView flexDirection="column" gap={16}>
                <BaseText
                    typographyFont="subSubTitleSemiBold"
                    color={theme.isDark ? COLORS.GREY_100 : COLORS.DARK_PURPLE}>
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
                        ListFooterComponent={<ListFooterComponent tab={tab} />}
                    />
                )}
            </BaseView>
        </>
    )
}
