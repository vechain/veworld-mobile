import { Balance, Network } from "~Model"
import { BalanceUtils } from "~Utils"

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

        if (!tokenBalance) continue

        tokenBalances.push(tokenBalance)
    }

    return tokenBalances
}
