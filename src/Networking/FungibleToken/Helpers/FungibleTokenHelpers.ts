import { Balance, FungibleToken, Network } from "~Model"
import { BalanceUtils } from "~Utils"
import {
    getTokenDecimals,
    getTokenName,
    getTokenSymbol,
} from "../FungibleTokenNetworking"

/**
 * Retrieves the token balances and information for a list of token addresses for a given account address.
 *
 * @param {string[]} tokenAddresses - Array of token addresses to fetch information and balances for.
 * @param {string} accountAddress - The account address for which balances need to be fetched.
 * @param {Network} network - The network context for the request.
 * @param {Connex.Thor} thorClient - The Connex.Thor client instance for fetching blockchain details.
 *
 * @returns {Promise<Balance[]>} - A promise that resolves with an array of token balances and their information.
 */
export const getTokenBalancesAndInfoFromTokenAddresses = async (
    tokenAddresses: string[],
    accountAddress: string,
    network: Network,
    thorClient: Connex.Thor,
) => {
    const tokenBalances: Balance[] = []

    for (const tokenAddress of tokenAddresses) {
        const tokenBalance =
            await BalanceUtils.getBalanceAndTokenInfoFromBlockchain(
                tokenAddress,
                accountAddress,
                network,
                thorClient,
            )
        tokenBalances.push(tokenBalance)
    }

    return tokenBalances
}

/**
 * Retrieves detailed information for a list of fungible token addresses.
 *
 * @param {string[]} tokenAddresses - Array of token addresses to fetch information for.
 * @param {Connex.Thor} thorClient - The Connex.Thor client instance for fetching blockchain details.
 *
 * @returns {Promise<FungibleToken[]>} - A promise that resolves with an array of detailed fungible token information.
 */
export const getTokenInfoFromTokenAddresses = async (
    tokenAddresses: string[],
    thorClient: Connex.Thor,
): Promise<FungibleToken[]> => {
    const fungibleTokens: FungibleToken[] = []

    for (const tokenAddress of tokenAddresses) {
        const tokenName = await getTokenName(tokenAddress, thorClient)
        const tokenSymbol = await getTokenSymbol(tokenAddress, thorClient)
        const tokenDecimals = await getTokenDecimals(tokenAddress, thorClient)

        fungibleTokens.push({
            address: tokenAddress,
            name: tokenName,
            symbol: tokenSymbol,
            decimals: tokenDecimals,
            genesisId: thorClient.genesis.id,
            custom: true,
            icon: "",
        })
    }

    return fungibleTokens
}
