import { debug } from "~Utils"
import {
    getActivitiesFromIncomingTransfers,
    getActivitiesFromTransactions,
} from "."
import { Activity } from "~Model"
import {
    ORDER,
    getIncomingTransfersOrigin,
    getTransactionsOrigin,
} from "~Constants"
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
    thor: Connex.Thor,
): Promise<FetchTransactionsResponse> => {
    debug(`Fetching transactions for ${address}`)

    try {
        return await fetchFromEndpoint<FetchTransactionsResponse>(
            getTransactionsOrigin(
                thor,
                address,
                page,
                DEFAULT_PAGE_SIZE,
                ORDER.DESC,
            ),
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
    thor: Connex.Thor,
): Promise<FetchIncomingTransfersResponse> => {
    debug(`Fetching incoming transfers for ${address}`)

    try {
        return await fetchFromEndpoint<FetchIncomingTransfersResponse>(
            getIncomingTransfersOrigin(
                thor,
                address,
                page,
                DEFAULT_PAGE_SIZE,
                ORDER.DESC,
            ),
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
    debug(`Fetching block ${blockId}`)

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
    thor: Connex.Thor,
): Promise<Activity[]> => {
    // Fetch transactions for the account address
    const transactions: FetchTransactionsResponse = await fetchTransactions(
        address,
        page,
        thor,
    )

    const incomingTransfers: FetchIncomingTransfersResponse =
        await fetchIncomingTransfers(address, page, thor)

    let activitiesFetched: Activity[] = []

    const transactionActivities = getActivitiesFromTransactions(
        transactions.data,
    )

    const incomingTransferActivities = getActivitiesFromIncomingTransfers(
        incomingTransfers.data,
        thor,
    )

    activitiesFetched = [
        ...transactionActivities,
        ...incomingTransferActivities,
    ]

    return activitiesFetched.sort((a, b) => b.timestamp - a.timestamp)
}
