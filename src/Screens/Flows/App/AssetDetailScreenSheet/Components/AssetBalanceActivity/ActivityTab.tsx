import { useNavigation } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import React, { useCallback } from "react"
import { StyleSheet } from "react-native"
import { SimpleActivitySectionList } from "~Components/Reusable/SimpleActivitySectionList"
import { useThemedStyles } from "~Hooks"
import { useAccountTokenActivities } from "~Hooks/useAccountTokenActivities"
import { Activity, FungibleToken, TransactionOutcomes } from "~Model"
import { Routes, TabStackParamList } from "~Navigation"
import { SkeletonActivityBox } from "~Screens/Flows/App/ActivityScreen/Components"
import { ActivityTabFooter } from "./ActivityTabFooter"

export const ActivityTab = ({ token }: { token: FungibleToken }) => {
    const { styles } = useThemedStyles(baseStyles)
    const nav = useNavigation<NativeStackNavigationProp<TabStackParamList>>()

    const {
        data: activities,
        fetchNextPage,
        isFetchingNextPage,
        hasNextPage,
        isPending,
    } = useAccountTokenActivities(token)

    const onActivityPress = useCallback(
        (activity: Activity, _token?: FungibleToken, isSwap?: boolean, decodedClauses?: TransactionOutcomes) => {
            nav.navigate(Routes.HISTORY_STACK, {
                screen: Routes.ACTIVITY_DETAILS,
                params: {
                    activity,
                    token: _token,
                    isSwap,
                    decodedClauses,
                    returnScreen: Routes.TOKEN_DETAILS,
                },
            })
        },
        [nav],
    )

    const onLoadMore = useCallback(() => {
        fetchNextPage()
    }, [fetchNextPage])

    return (
        <SimpleActivitySectionList
            activities={activities?.data ?? []}
            onActivityPress={onActivityPress}
            contentContainerStyle={styles.listContainer}
            scrollEnabled={false}
            nestedScrollEnabled
            ListFooterComponent={
                <ActivityTabFooter onClick={onLoadMore} isLoading={isFetchingNextPage} show={hasNextPage} />
            }
            ListEmptyComponent={isPending ? <SkeletonActivityBox /> : null}
        />
    )
}

const baseStyles = () =>
    StyleSheet.create({
        listContainer: {
            paddingHorizontal: 0,
        },
    })
