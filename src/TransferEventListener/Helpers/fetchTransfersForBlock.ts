import { ORDER, getTransfersForBlock } from "~Constants"
import { NETWORK_TYPE } from "~Model"
import {
    DEFAULT_PAGE_SIZE,
    FetchIncomingTransfersResponse,
    fetchFromEndpoint,
} from "~Networking"
import { debug } from "~Utils"

/**
 * Fetches transfers for a list of address for a specific block number.
 *
 * @param {number} blockNumber - The block number to fetch transfers for.
 * @param {array<string>} addresses - A list of addresses.
 * @param {number} page - The page number to fetch.
 *
 * @returns {Promise<FetchIncomingTransfersResponse[]>} A promise that resolves to an array of incoming transfers.
 *
 * @throws Will throw an error if the network request fails.
 */
export const fetchTransfersForBlock = async (
    blockNumber: number,
    addresses: string[],
    page: number,
    networType: NETWORK_TYPE,
): Promise<FetchIncomingTransfersResponse> => {
    debug(`Fetching transfers for ${addresses} at block ${blockNumber}`)
    try {
        return await fetchFromEndpoint<FetchIncomingTransfersResponse>(
            getTransfersForBlock(
                blockNumber,
                addresses,
                page,
                DEFAULT_PAGE_SIZE,
                ORDER.DESC,
                networType,
            ),
        )
    } catch (error) {
        throw new Error(`Failed to fetch transfers: ${error}`)
    }
}
