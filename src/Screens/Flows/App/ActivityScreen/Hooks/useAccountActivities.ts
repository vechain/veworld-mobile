import { useIsFocused } from "@react-navigation/native"
import { InfiniteData, useInfiniteQuery, useQueryClient } from "@tanstack/react-query"
import { useCallback, useMemo, useState } from "react"
import { Activity, createActivityFromIndexedHistoryEvent } from "~Model"
import { fetchIndexedHistoryEvent, sortActivitiesByTimestamp } from "~Networking"
import {
    selectAllLocalActivitiesByAccountAddressAndCurrentNetwork,
    selectSelectedAccount,
    selectSelectedNetwork,
    useAppSelector,
} from "~Storage/Redux"

export const useAccountActivities = () => {
    const queryClient = useQueryClient()
    const selectedAccount = useAppSelector(selectSelectedAccount)
    const network = useAppSelector(selectSelectedNetwork)
    const localActivities = useAppSelector(selectAllLocalActivitiesByAccountAddressAndCurrentNetwork)

    const isFocused = useIsFocused()

    const [isRefreshing, setIsRefreshing] = useState(false)

    const fetchActivities = useCallback(
        async ({ pageParam = 0 }: { pageParam: number }) => {
            return await fetchIndexedHistoryEvent(selectedAccount.address, pageParam, network)
        },
        [network, selectedAccount.address],
    )

    const { data, error, fetchNextPage, hasNextPage, isFetching, isFetchingNextPage, isLoading } = useInfiniteQuery({
        queryKey: [["accountActivities", selectedAccount.address, network.type]],
        queryFn: fetchActivities,
        initialPageParam: 0,
        getNextPageParam: (lastPage, pages) => {
            return lastPage.pagination.hasNext ? pages.length + 1 : undefined
        },
        enabled: isFocused,
    })

    const refreshActivities = useCallback(async () => {
        setIsRefreshing(true)
        queryClient.setQueryData<InfiniteData<any>>(["accountActivities", selectedAccount.address, network.type], {
            pages: [],
            pageParams: [undefined], // Reset page params as well
        })

        // Invalidate and refetch
        await queryClient.invalidateQueries({
            queryKey: ["accountActivities", selectedAccount.address, network.type],
        })
        setIsRefreshing(false)
    }, [network.type, queryClient, selectedAccount.address])

    const getActivities = useCallback(async () => {
        if (hasNextPage) {
            await fetchNextPage()
        }
    }, [fetchNextPage, hasNextPage])

    const activities = useMemo(() => {
        if (data?.pages) {
            const remoteActivities =
                data.pages
                    .flatMap(page => page.data)
                    .map(event => createActivityFromIndexedHistoryEvent(event, selectedAccount.address, network)) || []

            if (localActivities.length > 0 && remoteActivities.length > 0) {
                const startingTimestamp =
                    remoteActivities.length > 0
                        ? remoteActivities[remoteActivities.length - 1].timestamp
                        : Number.MAX_SAFE_INTEGER

                const endingTimestano = remoteActivities.length > 0 ? remoteActivities[0].timestamp : 0

                const localActivitiesByTimsstamp = localActivities.filter(
                    act => act.timestamp >= startingTimestamp && act.timestamp <= endingTimestano,
                )

                const localActivitiesByTxId = localActivitiesByTimsstamp.map(act => act.txId)
                const localActivitiesNotListed: Activity[] = []

                remoteActivities.forEach(act => {
                    if (!localActivitiesByTxId.includes(act.txId)) {
                        localActivitiesNotListed.push(act)
                    }
                })

                const allActivities = remoteActivities.concat(localActivitiesNotListed)
                sortActivitiesByTimestamp(allActivities)
                return allActivities
            }

            return remoteActivities
        } else if (!isFetching && !isLoading && !isFetchingNextPage) {
            return localActivities
        }

        return []
    }, [data?.pages, isFetching, isFetchingNextPage, isLoading, localActivities, network, selectedAccount.address])

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
