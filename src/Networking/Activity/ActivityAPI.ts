import { ERROR_EVENTS, getIndexedHistoryEventOrigin, getTransactionOrigin, ORDER } from "~Constants"
import { ActivityEvent, Network } from "~Model"
import { DEFAULT_PAGE_SIZE, FetchActivitiesResponse, fetchFromEndpoint, TransactionsResponse } from "~Networking"
import { debug } from "~Utils"

export const fetchIndexedHistoryEvent = async (
    address: string,
    page: number,
    networkType: Network,
    eventNames: Readonly<ActivityEvent[]> = [],
    {
        pageSize = DEFAULT_PAGE_SIZE,
        contractAddress,
    }: {
        /**
         * Size of the page.
         * @default DEFAULT_PAGE_SIZE
         */
        pageSize?: number
        /**
         * Add of the contract that emitted the event
         */
        contractAddress?: string
    } = {},
) => {
    debug(ERROR_EVENTS.ACTIVITIES, `Fetching activities for ${address}`)

    try {
        const endpoint = getIndexedHistoryEventOrigin({
            networkType: networkType.type,
            address,
            page,
            pageSize,
            direction: ORDER.DESC,
            eventName: eventNames,
            contractAddress,
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
