import { useNavigation } from "@react-navigation/native"
import moment from "moment"
import React, { useCallback, useMemo, useRef } from "react"
import { RefreshControl, SectionList, SectionListData, SectionListRenderItemInfo, StyleSheet } from "react-native"
import { BaseSpacer, BaseText, BaseView } from "~Components"
import { useThemedStyles } from "~Hooks"
import { useI18nContext } from "~i18n"
import { Activity, FungibleToken, TransactionOutcomes } from "~Model"
import { Routes } from "~Navigation"
import { DateUtils, StringUtils } from "~Utils"
import { ActivityItemRenderer } from "./ActivityItemRenderer"
import { SkeletonActivityBox } from "./SkeletonActivityBox"

enum SectionName {
    TODAY = "Today",
    YESTERDAY = "Yesterday",
}

type ActivitySection = {
    title: string
    data: Activity[]
}

type ActivitySectionListProps = {
    activities: Activity[]
    fetchActivities: () => Promise<void>
    refreshActivities: () => Promise<void>
    isFetching: boolean
    isRefreshing: boolean
    initialNumToRender?: number
}

const ItemSeparatorComponent = () => {
    return <BaseSpacer height={8} />
}

export const ActivitySectionList = ({
    activities,
    fetchActivities,
    refreshActivities,
    isFetching,
    isRefreshing,
    initialNumToRender = 10,
}: ActivitySectionListProps) => {
    const nav = useNavigation()
    const { styles, theme } = useThemedStyles(baseStyle)
    const { LL, locale } = useI18nContext()

    const hasScrolled = useRef(false)
    const onEndReachedCalledDuringMomentum = useRef(false)
    const sectionListRef = useRef<SectionList<Activity, ActivitySection>>(null)

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
            sections.push({
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
    }, [activities, addItemToSection, isToday, isYesterday])

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
                const monthDay = StringUtils.toTitleCase(DateUtils.formatDate(date, locale))
                const isDiffYear = moment().year() !== date.year()

                return (
                    <>
                        {isDiffYear && <BaseText typographyFont="captionSemiBold">{year}</BaseText>}
                        <BaseSpacer height={2} />
                        <BaseText typographyFont="bodySemiBold">{monthDay}</BaseText>
                    </>
                )
            }
        },
        [LL, locale],
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
                    <ActivityItemRenderer activity={activity} onPress={onActivityPress} />
                </>
            )
        },
        [onActivityPress],
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
                initialNumToRender={initialNumToRender}
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
