import axios from "axios"
import { ThorConstants, debug } from "~Common"
import {
    ActivityEndpoints,
    FetchTransactionsResponse,
    createBaseActivityFromTransaction,
    enrichActivityWithTokenData,
    enrichActivityWithVetTransfer,
} from "."
import { ORDER } from "./ActivityEndpoints"
import { Activity, ActivityType } from "~Model"

export const DEFAULT_PAGE_SIZE: number = 25
const TIMEOUT = 15000

/**
 * Fetches transactions for a given address.
 * @param address The address for which to fetch transactions.
 * @param page The page number to fetch.
 * @param thor The Thor instance to use.
 * @returns A promise that resolves to an array of transactions.
 * @throws Will throw an error if the network request fails.
 */
export const fetchTransactions = async (
    address: string,
    page: number,
    thor: Connex.Thor,
) => {
    debug(`Fetching transactions for ${address}`)

    // Indexer doesn't support testnet transaction indexing
    if (thor.genesis.id === ThorConstants.genesises.test.id) {
        throw new Error("Testnet transaction indexing is not supported")
    }

    try {
        const response = await axios.get<FetchTransactionsResponse[]>(
            ActivityEndpoints.getTransactionsOrigin(
                address,
                page,
                DEFAULT_PAGE_SIZE,
                ORDER.DESC,
            ),
            {
                timeout: TIMEOUT,
            },
        )

        return response.data
    } catch (error) {
        throw new Error(`Failed to fetch transactions: ${error}`)
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
 * @param address - The unique address of the account on the blockchain.
 * @param page - The page number to fetch. This is used for pagination purposes, where each page returns DEFAULT_PAGE_SIZE activities.
 * @param thor - An instance of the Connex.Thor blockchain interface.
 *
 * @returns A Promise that resolves to an array of Activity objects. These represent the transaction activities of the specified account.
 */
export const fetchAccountTransactionActivities = async (
    address: string,
    page: number,
    thor: Connex.Thor,
): Promise<Activity[]> => {
    // Fetch transactions for the account address
    const transactions: FetchTransactionsResponse[] = await fetchTransactions(
        address,
        page,
        thor,
    )

    const activitiesFetched: Activity[] = []

    for (const transaction of transactions) {
        // Create a base activity from the transaction
        let activity: Activity = createBaseActivityFromTransaction(transaction)

        // Enrich the activity with token data if it is a fungible token transfer
        if (activity.type === ActivityType.FUNGIBLE_TOKEN) {
            activity = enrichActivityWithTokenData(
                activity,
                transaction.clauses[0],
            )
        }

        // Enrich the activity with VET transfer data if it is a VET transfer
        if (activity.type === ActivityType.VET_TRANSFER) {
            activity = enrichActivityWithVetTransfer(
                activity,
                transaction.clauses[0],
            )
        }

        activitiesFetched.push(activity)
    }

    return activitiesFetched
}
