import { useNavigation } from "@react-navigation/native"
import moment from "moment"
import React, { useCallback, useMemo, useRef } from "react"
import { RefreshControl, SectionList, SectionListData, SectionListRenderItemInfo, StyleSheet } from "react-native"
import { BaseSpacer, BaseText, BaseView } from "~Components"
import { useThemedStyles } from "~Hooks"
import { useI18nContext } from "~i18n"
import {
    Activity,
    ActivityType,
    B3trActionActivity,
    B3trClaimRewardActivity,
    B3trProposalSupportActivity,
    B3trProposalVoteActivity,
    B3trSwapB3trToVot3Activity,
    B3trSwapVot3ToB3trActivity,
    B3trUpgradeGmActivity,
    B3trXAllocationVoteActivity,
    ConnectedAppActivity,
    DappTxActivity,
    FungibleToken,
    FungibleTokenActivity,
    NonFungibleTokenActivity,
    SignCertActivity,
    SwapActivity,
    TransactionOutcomes,
    TypedDataActivity,
    VeBetterDaoDapp,
} from "~Model"
import { Routes } from "~Navigation"
import { selectSelectedAccount, selectSelectedNetwork, useAppSelector } from "~Storage/Redux"
import { AddressUtils } from "~Utils"
import { useMonthTranslation } from "../Hooks"
import { ActivityBox } from "./ActivityBox"
import { SkeletonActivityBox } from "./SkeletonActivityBox"

enum SectionName {
    TODAY = "Today",
    YESTERDAY = "Yesterday",
}

type ActivitySection = {
    showYear: boolean
    title: string
    data: Activity[]
}

type ActivitySectionListProps = {
    activities: Activity[]
    fetchActivities: () => Promise<void>
    refreshActivities: () => Promise<void>
    isFetching: boolean
    isRefreshing: boolean
    veBetterDaoDapps: VeBetterDaoDapp[]
}

const ItemSeparatorComponent = () => {
    return <BaseSpacer height={8} />
}

const Item = ({
    activity,
    onPress,
    veBetterDaoDapps = [],
}: {
    activity: Activity
    veBetterDaoDapps: VeBetterDaoDapp[]
    onPress: (activity: Activity, token?: FungibleToken, isSwap?: boolean, decodedClauses?: TransactionOutcomes) => void
}) => {
    const activityToRender = activity

    switch (activity.type) {
        case ActivityType.TRANSFER_FT:
        case ActivityType.TRANSFER_VET: {
            return (
                <ActivityBox.TokenTransfer
                    key={activityToRender.id}
                    activity={activityToRender as FungibleTokenActivity}
                    onPress={onPress}
                />
            )
        }
        case ActivityType.TRANSFER_NFT:
            return (
                <ActivityBox.NFTTransfer
                    key={activityToRender.id}
                    activity={activity as NonFungibleTokenActivity}
                    onPress={onPress}
                />
            )
        case ActivityType.SWAP_FT_TO_FT:
        case ActivityType.SWAP_FT_TO_VET:
        case ActivityType.SWAP_VET_TO_FT:
            return <ActivityBox.TokenSwap activity={activity as SwapActivity} onPress={onPress} />
        case ActivityType.DAPP_TRANSACTION: {
            return (
                <ActivityBox.DAppTransaction
                    key={activityToRender.id}
                    activity={activityToRender as DappTxActivity}
                    onPress={onPress}
                />
            )
        }
        case ActivityType.SIGN_CERT:
            return (
                <ActivityBox.DAppSignCert
                    key={activityToRender.id}
                    activity={activityToRender as SignCertActivity}
                    onPress={onPress}
                />
            )
        case ActivityType.CONNECTED_APP_TRANSACTION:
            return (
                <ActivityBox.ConnectedAppActivity
                    key={activityToRender.id}
                    activity={activity as ConnectedAppActivity}
                    onPress={onPress}
                />
            )
        case ActivityType.SIGN_TYPED_DATA:
            return (
                <ActivityBox.SignedTypedData
                    key={activityToRender.id}
                    activity={activity as TypedDataActivity}
                    onPress={onPress}
                />
            )
        case ActivityType.B3TR_ACTION:
            return (
                <ActivityBox.B3trAction
                    activity={activity as B3trActionActivity}
                    onPress={onPress}
                    veBetterDaoDapps={veBetterDaoDapps}
                />
            )
        case ActivityType.B3TR_PROPOSAL_VOTE:
            return <ActivityBox.B3trProposalVote activity={activity as B3trProposalVoteActivity} onPress={onPress} />
        case ActivityType.B3TR_XALLOCATION_VOTE:
            return (
                <ActivityBox.B3trXAllocationVote activity={activity as B3trXAllocationVoteActivity} onPress={onPress} />
            )
        case ActivityType.B3TR_CLAIM_REWARD:
            return <ActivityBox.B3trClaimReward activity={activity as B3trClaimRewardActivity} onPress={onPress} />
        case ActivityType.B3TR_UPGRADE_GM:
            return <ActivityBox.B3trUpgradeGM activity={activity as B3trUpgradeGmActivity} onPress={onPress} />
        case ActivityType.B3TR_SWAP_B3TR_TO_VOT3:
            return (
                <ActivityBox.B3trSwapB3trToVot3 activity={activity as B3trSwapB3trToVot3Activity} onPress={onPress} />
            )
        case ActivityType.B3TR_SWAP_VOT3_TO_B3TR:
            return (
                <ActivityBox.B3trSwapVot3ToB3tr activity={activity as B3trSwapVot3ToB3trActivity} onPress={onPress} />
            )
        case ActivityType.B3TR_PROPOSAL_SUPPORT:
            return (
                <ActivityBox.B3trProposalSupport activity={activity as B3trProposalSupportActivity} onPress={onPress} />
            )
        default:
            return null
    }
}

export const ActivitySectionList = ({
    activities,
    fetchActivities,
    refreshActivities,
    isFetching,
    isRefreshing,
    veBetterDaoDapps,
}: ActivitySectionListProps) => {
    const nav = useNavigation()
    const { styles, theme } = useThemedStyles(baseStyle)
    const { LL } = useI18nContext()
    const network = useAppSelector(selectSelectedNetwork)
    const selectedAccount = useAppSelector(selectSelectedAccount)

    const previousNetwork = useRef(network)
    const hasScrolled = useRef(false)
    const onEndReachedCalledDuringMomentum = useRef(false)
    const prevSelectedAccountAddress = useRef(selectedAccount.address)
    const years = useRef<string[]>([moment().format("YYYY")])
    const sectionListRef = useRef<SectionList<Activity, ActivitySection>>(null)

    const { getMonthNamebyNumber } = useMonthTranslation()

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

    const isToday = useCallback((date: moment.Moment) => {
        const today = moment()
        return date.isSame(today, "day")
    }, [])

    const isYesterday = useCallback((date: moment.Moment) => {
        const yesterday = moment().subtract(1, "day")
        return date.isSame(yesterday, "day")
    }, [])

    const addItemToSection = useCallback((sections: ActivitySection[], activity: Activity, sectionName: string) => {
        const sectionExist = sections.find(section => section.title === sectionName)

        if (!sectionExist) {
            let showYear = false

            if (sectionName !== SectionName.TODAY && sectionName !== SectionName.YESTERDAY) {
                const date = moment(sectionName)
                const year = date.format("YYYY")

                if (!years.current.includes(year)) {
                    showYear = true
                    years.current.push(year)
                }
            }

            sections.push({
                showYear: showYear,
                title: sectionName,
                data: [activity],
            })
        } else {
            const itemExist = sectionExist.data.find(item => item.id === activity.id)

            if (!itemExist) {
                sectionExist.data.push(activity)
            }
        }

        return sections
    }, [])

    const sections = useMemo(() => {
        if (
            previousNetwork.current !== network ||
            !AddressUtils.compareAddresses(prevSelectedAccountAddress.current, selectedAccount.address)
        ) {
            years.current = []
        }

        const result = activities.reduce((acc: ActivitySection[], activity) => {
            const date = moment(activity.timestamp)

            if (isToday(date)) {
                addItemToSection(acc, activity, SectionName.TODAY)
            } else if (isYesterday(date)) {
                addItemToSection(acc, activity, SectionName.YESTERDAY)
            } else {
                const dateStartOfDay = date.startOf("day")
                addItemToSection(acc, activity, dateStartOfDay.toISOString())
            }

            return acc
        }, [])

        return result
    }, [activities, addItemToSection, isToday, isYesterday, network, selectedAccount.address])

    const onMomentumScrollBegin = useCallback(() => {
        onEndReachedCalledDuringMomentum.current = false
    }, [])

    const onEndReached = useCallback(async () => {
        if (!onEndReachedCalledDuringMomentum.current) {
            await fetchActivities()
            onEndReachedCalledDuringMomentum.current = true
        }
    }, [fetchActivities])

    const onRefresh = useCallback(async () => {
        await refreshActivities()
        years.current = []
        hasScrolled.current = false
    }, [refreshActivities])

    const renderSectionHeader = useCallback(
        ({ section }: { section: SectionListData<Activity, ActivitySection> }) => {
            const isTodaySection = section.title === SectionName.TODAY
            const isYesterdaySection = section.title === SectionName.YESTERDAY

            if (isTodaySection) {
                return <BaseText typographyFont="bodySemiBold">{LL.TODAY()}</BaseText>
            } else if (isYesterdaySection) {
                return <BaseText typographyFont="bodySemiBold">{LL.YESTERDAY()}</BaseText>
            } else {
                const date = moment(section.title)
                const year = date.format("YYYY")
                const monthNumber = date.month()
                const month = getMonthNamebyNumber(monthNumber)
                const day = date.format("DD")

                return (
                    <>
                        {section.showYear && <BaseText typographyFont="captionSemiBold">{year}</BaseText>}
                        <BaseSpacer height={2} />
                        <BaseText typographyFont="bodySemiBold">{`${month} ${day}`}</BaseText>
                    </>
                )
            }
        },
        [LL, getMonthNamebyNumber],
    )

    const renderSectionFooter = useCallback(() => {
        return <BaseSpacer height={24} />
    }, [])

    const renderListFooter = useCallback(() => {
        const showSkeleton = activities.length > 0 && isFetching
        return showSkeleton ? <SkeletonActivityBox /> : <BaseSpacer height={50} />
    }, [activities.length, isFetching])

    const renderItem = useCallback(
        ({ item: activity, index }: SectionListRenderItemInfo<Activity, ActivitySection>) => {
            return (
                <>
                    {index === 0 && <BaseSpacer height={8} />}
                    <Item activity={activity} onPress={onActivityPress} veBetterDaoDapps={veBetterDaoDapps} />
                </>
            )
        },
        [onActivityPress, veBetterDaoDapps],
    )

    const refreshControl = useMemo(() => {
        return <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={theme.colors.border} />
    }, [isRefreshing, onRefresh, theme.colors.border])

    const keyExtractor = useCallback((item: Activity) => {
        return item.id
    }, [])

    return (
        <BaseView style={styles.rootContainer}>
            <SectionList
                ref={sectionListRef}
                contentContainerStyle={styles.listContainer}
                sections={sections}
                initialNumToRender={10}
                renderItem={renderItem}
                keyExtractor={keyExtractor}
                renderSectionHeader={renderSectionHeader}
                ItemSeparatorComponent={ItemSeparatorComponent}
                renderSectionFooter={renderSectionFooter}
                onEndReached={onEndReached}
                ListFooterComponent={renderListFooter}
                showsVerticalScrollIndicator={false}
                scrollEventThrottle={16}
                onEndReachedThreshold={0.5}
                onMomentumScrollBegin={onMomentumScrollBegin}
                stickySectionHeadersEnabled={false}
                refreshControl={refreshControl}
            />
        </BaseView>
    )
}

const baseStyle = () =>
    StyleSheet.create({
        rootContainer: {
            flex: 1,
        },
        listContainer: {
            flexGrow: 1,
            paddingHorizontal: 16,
        },
        itemContainer: {
            borderRadius: 12,
            paddingVertical: 12,
            paddingHorizontal: 16,
        },
    })
