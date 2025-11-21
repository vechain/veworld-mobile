import { useNavigation } from "@react-navigation/native"
import React, { useCallback, useMemo } from "react"
import { FlatList, ListRenderItemInfo } from "react-native"
import { BaseSpacer, BaseText, BaseView } from "~Components"
import { Spinner } from "~Components/Reusable/Spinner"
import { COLORS } from "~Constants"
import { useTheme } from "~Hooks"
import { useI18nContext } from "~i18n"
import { Activity, FungibleToken, TransactionOutcomes } from "~Model"
import { Routes } from "~Navigation"
import { selectActivitiesWithoutFinality, useAppSelector } from "~Storage/Redux"
import { ActivityItemRenderer } from "./ActivityItemRenderer"

const ItemSeparatorComponent = () => {
    return <BaseSpacer height={8} />
}

export const PendingTransactions = () => {
    const { LL } = useI18nContext()
    const theme = useTheme()
    const pendingTransactions = useAppSelector(selectActivitiesWithoutFinality)

    const nav = useNavigation()

    const onActivityPress = useCallback(
        (activity: Activity, token?: FungibleToken, isSwap?: boolean, decodedClauses?: TransactionOutcomes) => {
            nav.navigate(Routes.ACTIVITY_DETAILS, {
                activity,
                token,
                isSwap,
                decodedClauses,
            })
        },
        [nav],
    )

    const renderItem = useCallback(
        ({ item: activity }: ListRenderItemInfo<Activity>) => {
            return <ActivityItemRenderer activity={activity} onPress={onActivityPress} />
        },
        [onActivityPress],
    )

    const keyExtractor = useCallback((item: Activity) => {
        return `${item.id}`
    }, [])

    const sortedTxs = useMemo(
        () => pendingTransactions.sort((a, b) => a.timestamp - b.timestamp),
        [pendingTransactions],
    )

    if (pendingTransactions.length === 0) return null

    return (
        <BaseView p={16} borderRadius={16} bg={theme.isDark ? COLORS.PURPLE_DISABLED : COLORS.GREY_200} mb={24} mx={16}>
            <BaseView flexDirection="row" gap={12} py={6} mb={12}>
                <Spinner color={theme.isDark ? COLORS.WHITE : COLORS.PURPLE} size={16} />
                <BaseText color={theme.isDark ? COLORS.WHITE : COLORS.PURPLE} typographyFont="bodySemiBold">
                    {LL.PENDING_ACTIVITY()}
                </BaseText>
            </BaseView>
            <FlatList
                data={sortedTxs}
                renderItem={renderItem}
                keyExtractor={keyExtractor}
                ItemSeparatorComponent={ItemSeparatorComponent}
                showsVerticalScrollIndicator={false}
                scrollEventThrottle={16}
                onEndReachedThreshold={0.5}
            />
        </BaseView>
    )
}
