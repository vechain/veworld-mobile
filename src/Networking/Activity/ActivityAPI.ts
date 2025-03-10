import { debug } from "~Utils"
import { getActivitiesFromIncomingTransfers, getActivitiesFromTransactions } from "./Helpers"
import { Activity, NETWORK_TYPE, Network } from "~Model"
import { ERROR_EVENTS, ORDER, getIncomingTransfersOrigin, getTransactionsOrigin } from "~Constants"
import {
    DEFAULT_PAGE_SIZE,
    FetchIncomingTransfersResponse,
    FetchTransactionsResponse,
    fetchFromEndpoint,
} from "~Networking"

/**
 * Fetches transactions for a given address.
 *
 * @param {string} address - The address for which to fetch transactions.
 * @param {number} page - The page number to fetch.
 * @param {Connex.Thor} thor - The Thor instance to use.
 *
 * @returns {Promise<FetchTransactionsResponse[]>} A promise that resolves to an array of transactions.
 *
 * @throws Will throw an error if the network request fails.
 */
export const fetchTransactions = async (
    address: string,
    page: number,
    networkType: NETWORK_TYPE,
): Promise<FetchTransactionsResponse> => {
    debug(ERROR_EVENTS.ACTIVITIES, `Fetching transactions for ${address}`)

    try {
        return await fetchFromEndpoint<FetchTransactionsResponse>(
            getTransactionsOrigin(networkType, address, page, DEFAULT_PAGE_SIZE, ORDER.DESC),
        )
    } catch (error) {
        throw new Error(`Failed to fetch transactions: ${error}`)
    }
}

/**
 * Fetches incoming transfers for a given address.
 *
 * @param {string} address - The address for which to fetch incoming transfers.
 * @param {number} page - The page number to fetch.
 * @param {Connex.Thor} thor - The Thor instance to use.
 *
 * @returns {Promise<FetchIncomingTransfersResponse[]>} A promise that resolves to an array of incoming transfers.
 *
 * @throws Will throw an error if the network request fails.
 */
export const fetchIncomingTransfers = async (
    address: string,
    page: number,
    networkType: NETWORK_TYPE,
): Promise<FetchIncomingTransfersResponse> => {
    debug(ERROR_EVENTS.ACTIVITIES, `Fetching incoming transfers for ${address}`)

    try {
        return await fetchFromEndpoint<FetchIncomingTransfersResponse>(
            getIncomingTransfersOrigin(networkType, address, page, DEFAULT_PAGE_SIZE, ORDER.DESC),
        )
    } catch (error) {
        throw new Error(`Failed to fetch incoming transfers: ${error}`)
    }
}

/**
 * Fetches a block from the Thor blockchain.
 *
 * @param blockId - The unique identifier of the block to fetch.
 * @param thor - An instance of the Connex.Thor blockchain interface.
 *
 * @returns A Promise that resolves to the requested block, or null if the block does not exist.
 */
export const fetchBlock = async (blockId: string, thor: Connex.Thor) => {
    debug(ERROR_EVENTS.ACTIVITIES, `Fetching block ${blockId}`)

    const block: Connex.Thor.Block | null = await thor.block(blockId).get()

    return block
}

/**
 * Fetches activities from an account's transactions on the Thor blockchain.
 *
 * @param {string} address - The unique address of the account on the blockchain.
 * @param {number} page - The page number to fetch. This is used for pagination purposes, where each page returns DEFAULT_PAGE_SIZE activities.
 * @param {Connex.Thor} thor - An instance of the Connex.Thor blockchain interface.
 *
 * @returns {Promise<Activity[]>} A Promise that resolves to an array of Activity objects. These represent the transaction activities of the specified account.
 */
export const fetchAccountTransactionActivities = async (
    address: string,
    page: number,
    network: Network,
): Promise<Activity[]> => {
    const [transactions, incomingTransfers] = await Promise.all([
        fetchTransactions(address, page, network.type),
        fetchIncomingTransfers(address, page, network.type),
    ])

    let activitiesFetched: Activity[] = []

    const transactionActivities = getActivitiesFromTransactions(transactions.data)

    const incomingTransferActivities = getActivitiesFromIncomingTransfers(incomingTransfers.data, network)

    activitiesFetched = [...incomingTransferActivities, ...transactionActivities]

    return activitiesFetched
}
