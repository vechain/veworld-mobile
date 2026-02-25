import React, { useMemo } from "react"
import { FlatList, StyleSheet } from "react-native"
import { BaseSpacer } from "~Components"
import { useThemedStyles, useVeBetterDaoDapps } from "~Hooks"
import { filterValues } from "../constants"
import { useAccountActivities } from "../Hooks"
import { ActivitySectionList } from "./ActivitySectionList"
import { SkeletonActivityBox } from "./SkeletonActivityBox"
import { ActivityStatus } from "~Model"

type ActivitiesProps = {
    filter:
        | typeof filterValues.all
        | typeof filterValues.b3tr
        | typeof filterValues.swap
        | typeof filterValues.transfer
        | typeof filterValues.nfts
        | typeof filterValues.dapps
        | typeof filterValues.staking
        | typeof filterValues.other
    emptyComponent: React.JSX.Element
}

const SKELETON_COUNT = 6

export const Activities = ({ filter, emptyComponent }: ActivitiesProps) => {
    const { styles } = useThemedStyles(baseStyles)
    const { activities, fetchActivities, isFetching, refreshActivities, isRefreshing } = useAccountActivities(
        filter.type,
        filter.value,
    )
    const { isPending } = useVeBetterDaoDapps()

    const filteredActivities = useMemo(() => {
        return activities.filter(activity => activity.status !== ActivityStatus.PENDING)
    }, [activities])

    const renderActivitiesList = useMemo(() => {
        return (
            <ActivitySectionList
                activities={filteredActivities}
                fetchActivities={fetchActivities}
                refreshActivities={refreshActivities}
                isFetching={isFetching || isPending}
                isRefreshing={isRefreshing}
            />
        )
    }, [filteredActivities, fetchActivities, isFetching, isPending, isRefreshing, refreshActivities])

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
                scrollEnabled={!isFetching || filteredActivities?.length > 0}
            />
        )
    }, [filteredActivities?.length, isFetching, styles.list])

    if (filteredActivities.length > 0) {
        return renderActivitiesList
    } else if (isFetching && filteredActivities.length === 0) {
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
