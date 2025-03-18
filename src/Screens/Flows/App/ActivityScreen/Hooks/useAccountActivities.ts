import { useIsFocused } from "@react-navigation/native"
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query"
import { useCallback, useMemo, useState } from "react"
import { Activity, ActivityEvent } from "~Model"
import { createActivityFromIndexedHistoryEvent, fetchIndexedHistoryEvent, sortActivitiesByTimestamp } from "~Networking"
import {
    selectAllActivitiesByAccountAddressAndNetwork,
    selectSelectedAccount,
    selectSelectedNetwork,
    useAppSelector,
} from "~Storage/Redux"
// import { ActivityUtils } from "~Utils"
import { FilterType } from "../constants"

export const useAccountActivities = (filterType: FilterType, filters: Readonly<ActivityEvent[]> = []) => {
    const queryClient = useQueryClient()
    const selectedAccount = useAppSelector(selectSelectedAccount)
    const network = useAppSelector(selectSelectedNetwork)
    const localActivities = useAppSelector(selectAllActivitiesByAccountAddressAndNetwork)

    const isFocused = useIsFocused()

    const [isRefreshing, setIsRefreshing] = useState(false)

    const fetchActivities = useCallback(
        async ({ pageParam = 0 }: { pageParam: number }) => {
            return await fetchIndexedHistoryEvent(selectedAccount.address, pageParam, network, filters)
        },
        [filters, network, selectedAccount.address],
    )

    const { data, error, fetchNextPage, hasNextPage, isFetching, isFetchingNextPage, isLoading } = useInfiniteQuery({
        queryKey: ["accountActivities", filterType, selectedAccount.address, network.genesis.id],
        queryFn: fetchActivities,
        initialPageParam: 0,
        getNextPageParam: (lastPage, pages) => {
            return lastPage.pagination.hasNext ? pages.length + 1 : undefined
        },
        enabled: isFocused,
    })

    const refreshActivities = useCallback(async () => {
        setIsRefreshing(true)
        await queryClient.invalidateQueries({
            queryKey: ["accountActivities", filterType, selectedAccount.address, network.genesis.id],
        })
        setIsRefreshing(false)
    }, [filterType, network.genesis.id, queryClient, selectedAccount.address])

    const getActivities = useCallback(async () => {
        if (hasNextPage) {
            await fetchNextPage()
        }
    }, [fetchNextPage, hasNextPage])

    // const mergeActivities = useCallback((arr1: Activity[], arr2: Activity[]): Activity[] => {
    //     const map = new Map<string, Activity>()

    //     const addActivity = (activity: Activity) => {
    //         const id = ActivityUtils.isTransactionActivity(activity) && activity.txId ? activity.txId : activity.id
    //         map.set(id, activity)
    //     }

    //     arr1.forEach(addActivity)
    //     arr2.forEach(addActivity)
    //     return Array.from(map.values())
    // }, [])

    const activities = useMemo(() => {
        if (data && data.pages?.length > 0) {
            const remoteActivities: Activity[] = []

            data.pages
                .flatMap(page => page.data)
                .forEach(event => {
                    const activity = createActivityFromIndexedHistoryEvent(event, selectedAccount.address, network)
                    if (activity) {
                        remoteActivities.push(activity)
                    }
                })

            if (localActivities.length > 0 && remoteActivities.length > 0 && filterType === FilterType.ALL) {
                // Ensure that the `localActivitiesByTimsstamp` array contains only local activities that
                // occurred from the earliest remote activity timestamp onwards.
                const remoteTimestamps = remoteActivities.map(act => act.timestamp)
                const startingTimestamp = Math.min(...remoteTimestamps)

                const localActivitiesByTimsstamp = localActivities.filter(act => {
                    return act.timestamp >= startingTimestamp
                })

                const allActivities = [...remoteActivities, ...localActivitiesByTimsstamp]
                sortActivitiesByTimestamp(allActivities)
                return allActivities
            }

            return remoteActivities
        } else if (!isFetching && !isLoading && !isFetchingNextPage) {
            sortActivitiesByTimestamp(localActivities)
            return localActivities
        }

        return []
    }, [data, isFetching, isLoading, isFetchingNextPage, localActivities, filterType, selectedAccount.address, network])

    const result = useMemo(
        () => ({
            isFetching: isFetching || isFetchingNextPage || isLoading,
            isRefreshing,
            fetchActivities: getActivities,
            refreshActivities,
            activities: activities,
            error: error,
        }),
        [activities, error, getActivities, isFetching, isFetchingNextPage, isLoading, isRefreshing, refreshActivities],
    )

    return result
}
