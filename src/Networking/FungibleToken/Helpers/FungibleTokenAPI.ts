import { ORDER, getFungibleTokensContracts } from "~Constants"
import { Balance, Network } from "~Model"
import {
    DEFAULT_PAGE_SIZE,
    FetchFungibleTokensContractsResponse,
    fetchFromEndpoint,
    getTokenBalancesAndInfoFromTokenAddresses,
} from "~Networking"
import { debug } from "~Utils"

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
) => {
    debug(`Fetching token addresses for ${accountAddress}`)

    try {
        return await fetchFromEndpoint<FetchFungibleTokensContractsResponse>(
            getFungibleTokensContracts(
                network,
                accountAddress,
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
 *
 * @returns {Promise<Balance[]>} A promise that resolves with the balances of the custom tokens owned.
 */
export const fetchCustomTokensOwned = async (
    accountAddress: string,
    page: number,
    thor: Connex.Thor,
    network: Network,
): Promise<Balance[]> => {
    const tokenAddresses: FetchFungibleTokensContractsResponse =
        await fetchFungibleTokensContracts(accountAddress, page, network)

    const fungibleTokens: Balance[] =
        await getTokenBalancesAndInfoFromTokenAddresses(
            tokenAddresses.data,
            accountAddress,
            network,
            thor,
        )

    return fungibleTokens
}
