import { ERROR_EVENTS, ORDER, getIndexedHistoryEventOrigin, getTransactionOrigin } from "~Constants"
import { Network } from "~Model"
import { DEFAULT_PAGE_SIZE, FetchActivitiesResponse, fetchFromEndpoint, TransactionsResponse } from "~Networking"
import { debug } from "~Utils"

export const fetchIndexedHistoryEvent = async (address: string, page: number, networkType: Network) => {
    debug(ERROR_EVENTS.ACTIVITIES, `Fetching activities for ${address}`)

    try {
        const endpoint = getIndexedHistoryEventOrigin({
            networkType: networkType.type,
            address,
            page,
            pageSize: DEFAULT_PAGE_SIZE,
            direction: ORDER.DESC,
        })
        return await fetchFromEndpoint<FetchActivitiesResponse>(endpoint)
    } catch (error) {
        throw new Error(`Failed to fetch activities: ${error}`)
    }
}

export const getTransaction = async (txId: string, network: Network) => {
    try {
        const endpoint = getTransactionOrigin(txId, network.type)
        return await fetchFromEndpoint<TransactionsResponse>(endpoint)
    } catch (error) {
        throw new Error(`Failed to fetch transaction: ${error}`)
    }
}
