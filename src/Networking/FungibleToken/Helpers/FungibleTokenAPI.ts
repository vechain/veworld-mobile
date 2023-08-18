import { ORDER, getFungibleTokensContracts } from "~Constants"
import { Balance, Network } from "~Model"
import {
    DEFAULT_PAGE_SIZE,
    FetchFungibleTokensContractsResponse,
    fetchFromEndpoint,
    getTokenBalancesAndInfoFromTokenAddresses,
} from "~Networking"
import { HexUtils, debug } from "~Utils"

/**
 * Fetches fungible token contracts for the given account address.
 *
 * @param {string} accountAddress The account address to fetch token contracts for.
 * @param {number} page The page number to fetch.
 * @param {Network} network The network to use.
 *
 * @returns {Promise<FetchFungibleTokensContractsResponse>} A promise that resolves with the fungible token contracts.
 * @throws {Error} Throws an error if there's a problem fetching the transactions.
 */
export const fetchFungibleTokensContracts = async (
    accountAddress: string,
    page: number,
    network: Network,
    officialTokensOnly: boolean = false,
) => {
    debug(`Fetching token addresses for ${accountAddress} page ${page}`)

    try {
        return await fetchFromEndpoint<FetchFungibleTokensContractsResponse>(
            getFungibleTokensContracts(
                network,
                accountAddress,
                officialTokensOnly,
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
 * Fetches custom tokens owned by the given account address.
 *
 * @param {string} accountAddress The account address to fetch owned tokens for.
 * @param {number} page The page number to fetch.
 * @param {Connex.Thor} thor The Connex.Thor instance to use.
 * @param {Network} network The network to use.
 * @param {boolean} officialTokensOnly Whether to fetch only official tokens or not.
 *
 * @returns {Promise<Balance[]>} A promise that resolves with the balances of the custom tokens owned.
 */
export const fetchTokensOwned = async (
    accountAddress: string,
    page: number,
    thor: Connex.Thor,
    network: Network,
    officialTokensOnly: boolean = false,
): Promise<Balance[]> => {
    const tokenAddresses: FetchFungibleTokensContractsResponse =
        await fetchFungibleTokensContracts(
            accountAddress,
            page,
            network,
            officialTokensOnly,
        )

    const fungibleTokens: Balance[] =
        await getTokenBalancesAndInfoFromTokenAddresses(
            tokenAddresses.data,
            accountAddress,
            network,
            thor,
        )

    return fungibleTokens
}

/**
 * Fetches all official tokens owned
 *
 */
export const fetchOfficialTokensOwned = async (
    accountAddress: string,
    network: Network,
): Promise<string[]> => {
    const tokenAddresses: string[] = []
    let page = 0
    let hasNextPage = true

    while (hasNextPage) {
        const tokenAddressesResponse = await fetchFungibleTokensContracts(
            accountAddress,
            page,
            network,
            true,
        )

        tokenAddresses.push(
            ...tokenAddressesResponse.data.map(t => HexUtils.normalize(t)),
        )

        hasNextPage = tokenAddressesResponse.pagination.hasNext
        page++
    }

    return tokenAddresses
}
