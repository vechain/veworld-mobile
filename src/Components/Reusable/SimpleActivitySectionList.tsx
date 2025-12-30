import moment from "moment"
import React, { useCallback, useMemo, useRef } from "react"
import { SectionList, SectionListData, SectionListProps, SectionListRenderItemInfo, StyleSheet } from "react-native"
import { BaseSectionListSeparatorProps, BaseSpacer, BaseText, SectionListSeparator } from "~Components"
import { useThemedStyles } from "~Hooks"
import { useI18nContext } from "~i18n"
import { Activity, FungibleToken, TransactionOutcomes } from "~Model"
import { ActivityItemRenderer } from "~Screens/Flows/App/ActivityScreen/Components/ActivityItemRenderer"
import { DateUtils, StringUtils } from "~Utils"

enum SectionName {
    TODAY = "Today",
    YESTERDAY = "Yesterday",
}

type ActivitySection = {
    title: string
    data: Activity[]
}

type Props = {
    activities: Activity[]
    onActivityPress: (
        activity: Activity,
        token?: FungibleToken,
        isSwap?: boolean,
        decodedClauses?: TransactionOutcomes,
    ) => void
} & Omit<
    SectionListProps<Activity, ActivitySection>,
    | "renderItem"
    | "sections"
    | "keyExtractor"
    | "renderSectionHeader"
    | "ItemSeparatorComponent"
    | "renderSectionFooter"
>

const ItemSeparatorComponent = () => {
    return <BaseSpacer height={8} />
}

const SectionSeparatorComponent = (props: BaseSectionListSeparatorProps<Activity, ActivitySection>) => {
    return <SectionListSeparator {...props} headerToHeaderHeight={24} headerToItemsHeight={8} />
}

export const SimpleActivitySectionList = ({ activities, onActivityPress, contentContainerStyle, ...props }: Props) => {
    const { styles, theme } = useThemedStyles(baseStyle)
    const { LL, locale } = useI18nContext()
    const sectionListRef = useRef<SectionList<Activity, ActivitySection>>(null)

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

        if (sectionExist) {
            const itemExist = sectionExist.data.find(item => item.id === activity.id)
            if (itemExist) return sections
            sectionExist.data.push(activity)
            return sections
        }

        sections.push({
            title: sectionName,
            data: [activity],
        })
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

    const renderSectionHeader = useCallback(
        ({ section }: { section: SectionListData<Activity, ActivitySection> }) => {
            const isTodaySection = section.title === SectionName.TODAY
            const isYesterdaySection = section.title === SectionName.YESTERDAY

            if (isTodaySection) {
                return (
                    <BaseText typographyFont="bodyMedium" color={theme.colors.activitySectionSeparator.text}>
                        {LL.TODAY()}
                    </BaseText>
                )
            } else if (isYesterdaySection) {
                return (
                    <BaseText typographyFont="bodyMedium" color={theme.colors.activitySectionSeparator.text}>
                        {LL.YESTERDAY()}
                    </BaseText>
                )
            } else {
                const date = moment(section.title)
                const year = date.format("YYYY")
                const monthDay = StringUtils.toTitleCase(DateUtils.formatDate(date, locale))
                const isDiffYear = moment().year() !== date.year()

                return (
                    <>
                        {isDiffYear && (
                            <BaseText typographyFont="captionMedium" color={theme.colors.activitySectionSeparator.text}>
                                {year}
                            </BaseText>
                        )}
                        <BaseSpacer height={2} />
                        <BaseText typographyFont="bodyMedium" color={theme.colors.activitySectionSeparator.text}>
                            {monthDay}
                        </BaseText>
                    </>
                )
            }
        },
        [LL, locale, theme.colors.activitySectionSeparator.text],
    )

    const renderItem = useCallback(
        ({ item: activity, index }: SectionListRenderItemInfo<Activity, ActivitySection>) => {
            return (
                <ActivityItemRenderer
                    activity={activity}
                    onPress={onActivityPress}
                    testID={`ActivityListItem_${index}`}
                />
            )
        },
        [onActivityPress],
    )

    const keyExtractor = useCallback(
        (item: Activity) => {
            //This needs to be done like this to rerender separators (it's a bug on the RN side)
            return `${item.id} - ${sections.length}`
        },
        [sections.length],
    )

    return (
        <SectionList
            ref={sectionListRef}
            contentContainerStyle={[styles.listContainer, contentContainerStyle]}
            sections={sections}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            renderSectionHeader={renderSectionHeader}
            ItemSeparatorComponent={ItemSeparatorComponent}
            showsVerticalScrollIndicator={false}
            scrollEventThrottle={16}
            onEndReachedThreshold={0.5}
            stickySectionHeadersEnabled={false}
            SectionSeparatorComponent={SectionSeparatorComponent}
            {...props}
        />
    )
}

const baseStyle = () =>
    StyleSheet.create({
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
