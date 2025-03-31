import React, { useMemo } from "react"
import { FlatList, StyleSheet } from "react-native"
import { BaseSpacer } from "~Components"
import { useThemedStyles, useVeBetterDaoDapps } from "~Hooks"
import { filterValues } from "../constants"
import { useAccountActivities } from "../Hooks"
import { ActivitySectionList } from "./ActivitySectionList"
import { SkeletonActivityBox } from "./SkeletonActivityBox"

type ActivitiesProps = {
    filter:
        | typeof filterValues.all
        | typeof filterValues.b3tr
        | typeof filterValues.swap
        | typeof filterValues.transfer
        | typeof filterValues.nfts
        | typeof filterValues.dapps
    emptyComponent: React.JSX.Element
}

const SKELETON_COUNT = 6

export const Activities = ({ filter, emptyComponent }: ActivitiesProps) => {
    const { styles } = useThemedStyles(baseStyles)
    const { activities, fetchActivities, isFetching, refreshActivities, isRefreshing } = useAccountActivities(
        filter.type,
        filter.value,
    )
    const { data: daoDapps, isPending } = useVeBetterDaoDapps()

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

    if (activities.length > 0) {
        return renderActivitiesList
    } else if (isFetching && activities.length === 0) {
        return renderSkeletonList
    } else {
        return emptyComponent
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
