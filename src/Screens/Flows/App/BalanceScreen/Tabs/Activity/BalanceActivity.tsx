import { useNavigation } from "@react-navigation/native"
import { useQuery } from "@tanstack/react-query"
import moment from "moment"
import React, { useCallback, useMemo } from "react"
import { FlatList, ListRenderItemInfo } from "react-native"
import { BaseSpacer, BaseText, BaseView } from "~Components"
import { COLORS } from "~Constants"
import { useTheme } from "~Hooks"
import { useI18nContext } from "~i18n"
import { Activity, ActivityEvent, FungibleToken, TransactionOutcomes } from "~Model"
import { Routes } from "~Navigation"
import { createActivityFromIndexedHistoryEvent, fetchIndexedHistoryEvent } from "~Networking"
import { ActivityItemRenderer } from "~Screens/Flows/App/ActivityScreen/Components/ActivityItemRenderer"
import { selectSelectedAccount, selectSelectedNetwork, useAppSelector } from "~Storage/Redux"
import { DateUtils, StringUtils } from "~Utils"
import { BalanceTab } from "../types"

const getActivityEventsByTab = (tab: BalanceTab): ActivityEvent[] => {
    switch (tab) {
        case "TOKENS":
            return [
                ActivityEvent.SWAP_FT_TO_FT,
                ActivityEvent.SWAP_FT_TO_VET,
                ActivityEvent.SWAP_VET_TO_FT,
                ActivityEvent.TRANSFER_FT,
                ActivityEvent.TRANSFER_SF,
                ActivityEvent.TRANSFER_VET,
                ActivityEvent.B3TR_ACTION,
                ActivityEvent.B3TR_CLAIM_REWARD,
                ActivityEvent.B3TR_SWAP_B3TR_TO_VOT3,
                ActivityEvent.B3TR_SWAP_VOT3_TO_B3TR,
                ActivityEvent.B3TR_UPGRADE_GM,
            ]
        case "STAKING":
            return [
                ActivityEvent.STARGATE_CLAIM_REWARDS_BASE,
                ActivityEvent.STARGATE_CLAIM_REWARDS_DELEGATE,
                ActivityEvent.STARGATE_DELEGATE,
                ActivityEvent.STARGATE_DELEGATE_ONLY,
                ActivityEvent.STARGATE_STAKE,
                ActivityEvent.STARGATE_UNDELEGATE,
                ActivityEvent.STARGATE_UNSTAKE,
            ]
        case "COLLECTIBLES":
            return [ActivityEvent.NFT_SALE, ActivityEvent.TRANSFER_NFT]
    }
}

const ItemSeparatorComponent = () => <BaseSpacer height={8} />

export const BalanceActivity = ({ tab }: { tab: BalanceTab }) => {
    const { LL, locale: _locale } = useI18nContext()
    const theme = useTheme()
    const selectedAccount = useAppSelector(selectSelectedAccount)
    const selectedNetwork = useAppSelector(selectSelectedNetwork)
    const nav = useNavigation()
    const locale = useMemo(() => DateUtils.getMomentLocale(_locale), [_locale])

    const fetchActivities = useCallback(async () => {
        return await fetchIndexedHistoryEvent(selectedAccount.address, 0, selectedNetwork, getActivityEventsByTab(tab))
    }, [selectedAccount.address, selectedNetwork, tab])

    const timestampRenderer = useCallback(
        (timestamp: number) => {
            const ts = moment(timestamp)
            if (ts.isSame(moment(), "day")) return ts.locale(locale).format(`HH:mm - [${LL.TODAY()}]`)
            if (ts.isSame(moment().subtract(1, "day"), "day"))
                return ts.locale(locale).format(`HH:mm - [${LL.YESTERDAY()}]`)
            if (moment().diff(ts, "year") >= 1)
                return StringUtils.toTitleCase(
                    ts.locale(locale).format(`HH:mm - [${DateUtils.formatDate(ts, locale, { includeYear: true })}]`),
                )
            return StringUtils.toTitleCase(ts.locale(locale).format(`HH:mm - [${DateUtils.formatDate(ts, locale)}]`))
        },
        [LL, locale],
    )

    const { data, isLoading } = useQuery({
        queryKey: ["BALANCE_ACTIVITIES", tab, selectedAccount.address, selectedNetwork.genesis.id],
        queryFn: fetchActivities,
        select(_data) {
            return _data.data
                .slice(0, 4)
                .map(evt => createActivityFromIndexedHistoryEvent(evt, selectedAccount.address, selectedNetwork))
                .filter((activity): activity is NonNullable<typeof activity> => activity !== null)
        },
    })

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
        ({ item }: ListRenderItemInfo<Activity>) => {
            return (
                <ActivityItemRenderer activity={item} onPress={onActivityPress} timestampRenderer={timestampRenderer} />
            )
        },
        [onActivityPress, timestampRenderer],
    )

    if (!isLoading && data?.length === 0) return null

    return (
        <BaseView flexDirection="column" gap={16}>
            <BaseText typographyFont="subSubTitleSemiBold" color={theme.isDark ? COLORS.GREY_50 : COLORS.DARK_PURPLE}>
                {LL.ACTIVITY()}
            </BaseText>
            <FlatList
                renderItem={renderItem}
                data={data ?? []}
                ItemSeparatorComponent={ItemSeparatorComponent}
                keyExtractor={item => item.id}
            />
        </BaseView>
    )
}
