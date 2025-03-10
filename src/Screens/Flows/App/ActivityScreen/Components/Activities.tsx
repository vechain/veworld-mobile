import React, { useCallback, useMemo } from "react"
import { useAccountActivities } from "../Hooks"
import { useThemedStyles, useVeBetterDaoDapps } from "~Hooks"
import { BaseSpacer, BaseView } from "~Components"
import { NoActivitiesButton } from "./NoActivitiesButton"
import { FlatList, StyleSheet } from "react-native"
import { SkeletonActivityBox } from "./SkeletonActivityBox"
import { ActivitySectionList } from "./ActivitySectionList"
import { useNavigation } from "@react-navigation/native"
import { Routes } from "~Navigation"
import { filterValues } from "../constants"

type ActivitiesProps = {
    filter?:
        | typeof filterValues.b3tr
        | typeof filterValues.swap
        | typeof filterValues.transfer
        | typeof filterValues.nfts
}

const SKELETON_COUNT = 6

export const Activities = ({ filter }: ActivitiesProps) => {
    const nav = useNavigation()
    const { styles } = useThemedStyles(baseStyles)
    const { activities, fetchActivities, isFetching, refreshActivities, isRefreshing } = useAccountActivities(filter)
    const { data: daoDapps, isPending } = useVeBetterDaoDapps()

    const onStartTransactingPress = useCallback(() => nav.navigate(Routes.SELECT_TOKEN_SEND), [nav])

    const renderActivitiesList = useMemo(() => {
        return (
            <ActivitySectionList
                activities={activities}
                fetchActivities={fetchActivities}
                refreshActivities={refreshActivities}
                isFetching={isFetching || isPending}
                isRefreshing={isRefreshing}
                veBetterDaoDapps={daoDapps ?? []}
            />
        )
    }, [activities, daoDapps, fetchActivities, isFetching, isPending, isRefreshing, refreshActivities])

    const renderSkeletonList = useMemo(() => {
        return (
            <FlatList
                data={[...Array(SKELETON_COUNT)]}
                keyExtractor={(_, index) => `skeleton-${index}`}
                contentContainerStyle={styles.list}
                ListFooterComponent={<BaseSpacer height={20} />}
                renderItem={() => {
                    return <SkeletonActivityBox />
                }}
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
                scrollEnabled={!isFetching || activities?.length > 0}
            />
        )
    }, [activities?.length, isFetching, styles.list])

    const renderNoActivitiesButton = useMemo(() => {
        return (
            <BaseView justifyContent="center" alignItems="center" w={100} style={styles.noActivitiesButton}>
                <NoActivitiesButton onPress={onStartTransactingPress} />
            </BaseView>
        )
    }, [onStartTransactingPress, styles.noActivitiesButton])

    if (activities.length > 0) {
        return renderActivitiesList
    } else if (isFetching && activities.length === 0) {
        return renderSkeletonList
    } else {
        return renderNoActivitiesButton
    }
}

const baseStyles = () =>
    StyleSheet.create({
        backIcon: {
            marginHorizontal: 8,
            alignSelf: "flex-start",
        },
        list: {
            flexGrow: 1,
            paddingHorizontal: 16,
        },
        noActivitiesButton: {
            position: "absolute",
            bottom: "50%",
        },
    })
