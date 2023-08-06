import { VET, VTHO, abis } from "~Constants"
import axios from "axios"
import { error } from "~Utils/Logger"
import { Network, Balance } from "~Model"
import AddressUtils from "../AddressUtils"
import FormattingUtils from "../FormattingUtils"
import { getTokenDecimals, getTokenName, getTokenSymbol } from "~Networking"

/**
 * Calls out to external sources to get the balance
 * @param tokenAddress
 * @param accountAddress
 * @returns balance
 */
const getBalanceFromBlockchain = async (
    tokenAddress: string,
    accountAddress: string,
    network: Network,
    thor: Connex.Thor,
): Promise<Balance> => {
    try {
        // We get the balance differently depending on whether it's a VIP180 or VET/VTHO
        let balance: string
        if (AddressUtils.compareAddresses(tokenAddress, VET.address))
            balance = await getVetAndVthoBalancesFromBlockchain(
                accountAddress,
                network,
            ).then(res => res.balance)
        else if (AddressUtils.compareAddresses(tokenAddress, VTHO.address))
            balance = await getVetAndVthoBalancesFromBlockchain(
                accountAddress,
                network,
            ).then(res => res.energy)
        else
            balance = await getTokenBalanceFromBlockchain(
                accountAddress,
                tokenAddress,
                thor,
            )

        return {
            balance,
            accountAddress,
            genesisId: network.genesis.id,
            tokenAddress,
            timeUpdated: new Date().toISOString(),
        }
    } catch (e) {
        error(e)
        throw new Error("Failed to get balance from external service")
    }
}

/**
 * Retrieves both the balance and token details of an account from external sources.
 *
 * @param tokenAddress - Address of the token.
 * @param accountAddress - Address of the account.
 * @param network - Network details.
 * @param thor - Connex instance.
 * @returns An object containing balance, token details and related info.
 */
const getBalanceAndTokenInfoFromBlockchain = async (
    tokenAddress: string,
    accountAddress: string,
    network: Network,
    thor: Connex.Thor,
): Promise<Balance> => {
    try {
        const balance: Balance = await getBalanceFromBlockchain(
            tokenAddress,
            accountAddress,
            network,
            thor,
        )

        const tokenName = await getTokenName(tokenAddress, thor)
        const tokenSymbol = await getTokenSymbol(tokenAddress, thor)
        const tokenDecimals = await getTokenDecimals(tokenAddress, thor)

        return {
            ...balance,
            tokenName,
            tokenSymbol,
            tokenDecimals,
        }
    } catch (e) {
        error(e)
        throw new Error(
            "Failed to get balance and token info from external service",
        )
    }
}

/**
 * Use axios instead of connex because connex waits indefinitely
 * @param address - the address to get the balances for
 * @param network - the network to get the balances for
 * @returns balances for VET and VTHO for the given address from the blockchain
 */
const getVetAndVthoBalancesFromBlockchain = async (
    address: string,
    network: Network,
): Promise<Connex.Thor.Account> => {
    const accountResponse = await axios.get<Connex.Thor.Account>(
        `${network.currentUrl}/accounts/${address}`,
    )

    return accountResponse.data
}

const getTokenBalanceFromBlockchain = async (
    accountAddress: string,
    tokenAddress: string,
    thor: Connex.Thor,
): Promise<string> => {
    try {
        const res = await thor
            .account(tokenAddress)
            .method(abis.VIP180.balanceOf)
            .call(accountAddress)

        return res.decoded[0]
    } catch (e) {
        error(e)
        throw new Error(
            "Failed to get data from contract. Wrong network/ Contract address? ",
        )
    }
}

const getFiatBalance = (
    balance: string,
    exchangeRate: number,
    decimals: number,
) =>
    FormattingUtils.humanNumber(
        FormattingUtils.convertToFiatBalance(balance, exchangeRate, decimals),
        balance,
    )

const getTokenUnitBalance = (balance: string, decimals: number) =>
    FormattingUtils.humanNumber(
        FormattingUtils.convertToFiatBalance(balance, 1, decimals),
        balance,
    )

export default {
    getBalanceFromBlockchain,
    getVetAndVthoBalancesFromBlockchain,
    getTokenBalanceFromBlockchain,
    getFiatBalance,
    getTokenUnitBalance,
    getBalanceAndTokenInfoFromBlockchain,
}
