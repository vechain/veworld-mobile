import { ERROR_EVENTS, ORDER, getIndexedHistoryEventOrigin } from "~Constants"
import { Network } from "~Model"
import { DEFAULT_PAGE_SIZE, FetchActivitiesResponse, fetchFromEndpoint } from "~Networking"
import { debug } from "~Utils"

export const fetchIndexedHistoryEvent = async (address: string, page: number, networkType: Network) => {
    debug(ERROR_EVENTS.ACTIVITIES, `Fetching activities for ${address}`)

    try {
        const endpoint = getIndexedHistoryEventOrigin(networkType.type, address, page, DEFAULT_PAGE_SIZE, ORDER.DESC)
        return await fetchFromEndpoint<FetchActivitiesResponse>(endpoint)
    } catch (error) {
        throw new Error(`Failed to fetch activities: ${error}`)
    }
}
