import { useNavigation } from "@react-navigation/native"
import React, { useCallback, useMemo, useRef } from "react"
import { RefreshControl, StyleSheet } from "react-native"
import { BaseSpacer, BaseView } from "~Components"
import { SimpleActivitySectionList } from "~Components/Reusable/SimpleActivitySectionList"
import { useThemedStyles } from "~Hooks"
import { Activity, FungibleToken, TransactionOutcomes } from "~Model"
import { Routes } from "~Navigation"
import { SkeletonActivityBox } from "./SkeletonActivityBox"

type ActivitySectionListProps = {
    activities: Activity[]
    fetchActivities: () => Promise<void>
    refreshActivities: () => Promise<void>
    isFetching: boolean
    isRefreshing: boolean
    initialNumToRender?: number
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

    const hasScrolled = useRef(false)
    const onEndReachedCalledDuringMomentum = useRef(false)

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

    const renderListFooter = useCallback(() => {
        const showSkeleton = activities.length > 0 && isFetching
        return showSkeleton ? <SkeletonActivityBox /> : <BaseSpacer height={50} />
    }, [activities.length, isFetching])

    const refreshControl = useMemo(() => {
        return <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={theme.colors.border} />
    }, [isRefreshing, onRefresh, theme.colors.border])

    return (
        <BaseView style={styles.rootContainer}>
            <SimpleActivitySectionList
                contentContainerStyle={styles.listContainer}
                initialNumToRender={initialNumToRender}
                onEndReached={onEndReached}
                ListFooterComponent={renderListFooter}
                onMomentumScrollBegin={onMomentumScrollBegin}
                refreshControl={refreshControl}
                activities={activities}
                onActivityPress={onActivityPress}
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
