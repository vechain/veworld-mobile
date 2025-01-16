import { useCallback, useEffect, useRef, useState } from "react"
import { showWarningToast } from "~Components"
import { ERROR_EVENTS } from "~Constants"
import { Activity } from "~Model"
import { fetchAccountTransactionActivities } from "~Networking"
import {
    selectSelectedAccount,
    selectSelectedNetwork,
    updateAccountTransactionActivities,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"
import { error, info } from "~Utils"
import { useI18nContext } from "~i18n"

export const useActivities = () => {
    const dispatch = useAppDispatch()
    const { LL } = useI18nContext()

    const selectedAccount = useAppSelector(selectSelectedAccount)
    const network = useAppSelector(selectSelectedNetwork)

    const page = useRef(0)
    const currentNetwork = useRef(network)

    const [isFetching, setIsFetching] = useState(true)
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [activities, setActivities] = useState<Activity[]>([])

    const resetPageNumber = useCallback(() => {
        page.current = 0
    }, [])

    const incrementPageNumber = useCallback(() => {
        page.current = page.current + 1
    }, [])

    const sortByTimestamp = useCallback((_activities: Activity[]) => {
        return _activities.sort((a, b) => b.timestamp - a.timestamp)
    }, [])

    const updateActivitiesState = useCallback(
        (newActivities: Activity[], reset: boolean = false) => {
            const getNewActivities = (prevActivities: Activity[]) => {
                let result: Activity[] = []

                if (reset) {
                    result = newActivities
                } else {
                    const activitiesById = new Map<string, Activity>()
                    prevActivities.forEach(activity => activitiesById.set(activity.id, activity))
                    newActivities.forEach(activity => activitiesById.set(activity.id, activity))
                    const mergedActivities = Array.from(activitiesById.values())
                    result = mergedActivities
                }

                return sortByTimestamp(result)
            }

            setActivities(getNewActivities)
        },
        [sortByTimestamp],
    )

    const getActivities = useCallback(
        async ({ refresh }: { refresh: boolean }) => {
            if (!selectedAccount) {
                setIsFetching(false)
                return
            }

            info(ERROR_EVENTS.ACTIVITIES, "Fetching activities on page", page)
            setIsFetching(true)
            let shouldRefresh = refresh
            const hasNetworkChanged = currentNetwork.current !== network

            if (hasNetworkChanged) {
                resetPageNumber()
                shouldRefresh = true
                currentNetwork.current = network
                updateActivitiesState([], true)
            }

            try {
                const txActivities = await fetchAccountTransactionActivities(
                    selectedAccount.address,
                    page.current,
                    network,
                )

                if (page.current === 0) {
                    dispatch(updateAccountTransactionActivities(txActivities))
                }

                updateActivitiesState(txActivities, shouldRefresh)
                incrementPageNumber()
            } catch (e) {
                error(ERROR_EVENTS.ACTIVITIES, e)

                showWarningToast({
                    text1: LL.HEADS_UP(),
                    text2: LL.ACTIVITIES_NOT_UP_TO_DATE(),
                })
            } finally {
                setIsFetching(false)
            }
        },
        [LL, dispatch, incrementPageNumber, network, resetPageNumber, selectedAccount, updateActivitiesState],
    )

    const refreshActivities = useCallback(async () => {
        resetPageNumber()
        setIsRefreshing(true)
        await getActivities({ refresh: true })
        setIsRefreshing(false)
    }, [getActivities, resetPageNumber])

    const fetchActivities = useCallback(async () => {
        await getActivities({ refresh: false })
    }, [getActivities])

    useEffect(() => {
        getActivities({ refresh: false })
    }, [getActivities])

    return {
        isFetching,
        isRefreshing,
        fetchActivities,
        refreshActivities,
        activities,
    }
}
