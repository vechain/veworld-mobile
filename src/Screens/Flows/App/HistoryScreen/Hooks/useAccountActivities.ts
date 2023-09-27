import { useCallback, useEffect, useState } from "react"
import { error, info } from "~Utils"
import { showWarningToast } from "~Components"
import { Activity } from "~Model"
import {
    selectCurrentActivities,
    selectSelectedAccount,
    selectSelectedNetwork,
    updateAccountTransactionActivities,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"
import { fetchAccountTransactionActivities } from "~Networking"
import { useI18nContext } from "~i18n"
import { InteractionManager } from "react-native"

/**
 * Custom React hook to fetch and manage account activities.
 *
 * @returns {{
 *   fetchActivities: Function,
 *   activities: Activity[],
 *   hasFetched: boolean,
 *   page: number,
 * }} An object containing:
 *     - fetchActivities: A function to fetch account activities.
 *     - activities: An array of account activity objects. Each object contains details about an account activity.
 *     - hasFetched: A boolean indicating whether the account activities have been fetched. `true` if the fetch operation is complete, `false` otherwise.
 *     - page: The current page number for the paginated activity data. The initial page is `0`.
 */
export const useAccountActivities = () => {
    // Initialize Redux dispatch
    const dispatch = useAppDispatch()

    const selectedAccount = useAppSelector(selectSelectedAccount)

    // Select network from Redux state
    const network = useAppSelector(selectSelectedNetwork)

    // Initialize internationalization context
    const { LL } = useI18nContext()

    // State variables
    const [hasFetched, setHasFetched] = useState<boolean>(false) // Indicates if activities have been fetched
    const [page, setPage] = useState<number>(0) // Current page number
    const [activities, setActivities] = useState<Activity[]>([]) // Current set of fetched activities

    // Select saved activities from Redux state
    const activitiesSaved = useAppSelector(selectCurrentActivities)

    /**
     * Fetches account activities from the backend and manages state accordingly.
     * Utilizes useCallback for memoization to prevent unnecessary re-renders.
     */
    const fetchActivities = useCallback(async () => {
        info("Fetching activities on page", page)
        // Reset hasFetched flag
        setHasFetched(false)
        // Proceed if address exists
        if (selectedAccount) {
            try {
                // Fetch transaction activities
                const txActivities = await fetchAccountTransactionActivities(
                    selectedAccount.address,
                    page,
                    network,
                )

                // If first page, update Redux state and set activities state
                if (page === 0) {
                    dispatch(updateAccountTransactionActivities(txActivities))

                    setActivities(txActivities)
                    incrementPageAndSetFetchedFlag()
                    return
                }

                // If no more activities to fetch, set fetched flag and return
                if (txActivities.length === 0) {
                    setHasFetched(true)
                    return
                }

                // Merge previous activities and new ones, avoiding duplicates
                setActivities(prevActivities => {
                    const activitiesMap = new Map<string, Activity>()
                    const concatenatedActivities = [
                        ...prevActivities,
                        ...txActivities,
                    ]

                    concatenatedActivities.forEach(activity =>
                        activitiesMap.set(activity.id, activity),
                    )

                    // Sort activities by timestamp and return
                    const sortedActivities = Array.from(
                        activitiesMap.values(),
                    ).sort((a, b) => b.timestamp - a.timestamp)

                    return sortedActivities
                })

                incrementPageAndSetFetchedFlag()
            } catch (e) {
                // In case of error, log and show warning toast
                error("fetchActivities", e)

                showWarningToast(LL.HEADS_UP(), LL.ACTIVITIES_NOT_UP_TO_DATE())

                // Set fetched flag
                setHasFetched(true)
                if (page === 0) setPage(prevPage => prevPage + 1)
            }
        }
    }, [page, selectedAccount, network, dispatch, LL])

    // Helper function to increment page and set fetched flag
    const incrementPageAndSetFetchedFlag = () => {
        setPage(prevPage => prevPage + 1)
        setHasFetched(true)
    }

    // Update activities when saved activities in Redux state changes
    useEffect(() => {
        setActivities(activitiesSaved)
    }, [activitiesSaved])

    // Fetch activities on initial component mount or account change
    useEffect(() => {
        const fetchOnMount = async () => {
            await fetchActivities()
        }

        InteractionManager.runAfterInteractions(() => {
            if (page === 0) fetchOnMount()
        })
    }, [fetchActivities, page])

    // Reset page number on network change or on account change
    useEffect(() => {
        setPage(0)
    }, [network.type, selectedAccount])

    return {
        fetchActivities,
        activities,
        hasFetched,
        page,
        setPage,
    }
}
