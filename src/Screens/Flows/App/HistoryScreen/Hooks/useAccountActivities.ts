import { useCallback, useEffect, useState } from "react"
import { error, info } from "~Utils"
import { showWarningToast, useThor } from "~Components"
import { Activity } from "~Model"
import {
    selectCurrentActivities,
    updateAccountTransactionActivities,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"
import { fetchAccountTransactionActivities } from "~Storage/Redux/Actions/Activity/API"
import { useI18nContext } from "~i18n"

/**
 * Custom React hook to fetch and manage account activities.
 *
 * @param {string} address - The Ethereum address for which activities will be fetched.
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
export const useAccountActivities = (address: string) => {
    // Initialize Redux dispatch
    const dispatch = useAppDispatch()

    // Initialize Thor context
    const thor = useThor()

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
        if (address) {
            try {
                // Fetch transaction activities
                const txActivities = await fetchAccountTransactionActivities(
                    address,
                    page,
                    thor,
                )

                // If first page, update Redux state and set activities state
                if (page === 0) {
                    dispatch(
                        updateAccountTransactionActivities(txActivities, thor),
                    )

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
    }, [address, page, thor, dispatch, LL])

    // Helper function to increment page and set fetched flag
    const incrementPageAndSetFetchedFlag = () => {
        setPage(prevPage => prevPage + 1)
        setHasFetched(true)
    }

    // Update activities when saved activities in Redux state changes
    useEffect(() => {
        setActivities(activitiesSaved)
    }, [activitiesSaved])

    // Fetch activities on initial component mount
    useEffect(() => {
        const fetchOnMount = async () => {
            await fetchActivities()
        }

        if (page === 0) fetchOnMount()
    }, [fetchActivities, page])

    // Reset page number on network change
    useEffect(() => {
        setPage(0)
    }, [thor.genesis.id])

    return {
        fetchActivities,
        activities,
        hasFetched,
        page,
        setPage,
    }
}
