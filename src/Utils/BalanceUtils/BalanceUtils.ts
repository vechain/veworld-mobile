import { abis, ERROR_EVENTS, VET, VTHO } from "~Constants"
import axios from "axios"
import { error, info } from "~Utils/Logger"
import { Balance, FungibleTokenWithBalance, Network } from "~Model"
import AddressUtils from "../AddressUtils"
import { getTokenDecimals, getTokenName, getTokenSymbol } from "~Networking"
import { BigNumber } from "bignumber.js"
import BigNutils from "~Utils/BigNumberUtils"

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
): Promise<Balance | undefined> => {
    try {
        // We get the balance differently depending on whether it's a VIP180 or VET/VTHO
        let balance: string | undefined
        if (AddressUtils.compareAddresses(tokenAddress, VET.address))
            balance = await getVetAndVthoBalancesFromBlockchain(accountAddress, network).then(res => res.balance)
        else if (AddressUtils.compareAddresses(tokenAddress, VTHO.address))
            balance = await getVetAndVthoBalancesFromBlockchain(accountAddress, network).then(res => res.energy)
        else balance = await getTokenBalanceFromBlockchain(accountAddress, tokenAddress, thor)

        if (!balance) return

        return {
            balance,
            tokenAddress,
            timeUpdated: new Date().toISOString(),
            isHidden: false,
        }
    } catch (e) {
        error(ERROR_EVENTS.TOKENS, e)
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
): Promise<Balance | undefined> => {
    try {
        const balance: Balance | undefined = await getBalanceFromBlockchain(tokenAddress, accountAddress, network, thor)

        if (!balance) return undefined

        const [tokenName, tokenSymbol, tokenDecimals] = await Promise.all([
            getTokenName(tokenAddress, thor),
            getTokenSymbol(tokenAddress, thor),
            getTokenDecimals(tokenAddress, thor),
        ])

        return {
            ...balance,
            tokenName,
            tokenSymbol,
            tokenDecimals,
        }
    } catch (e) {
        error(ERROR_EVENTS.TOKENS, e)
    }
}

/**
 * Use axios instead of connex because connex waits indefinitely
 * @param address - the address to get the balances for
 * @param network - the network to get the balances for
 * @returns balances for VET and VTHO for the given address from the blockchain
 */
const getVetAndVthoBalancesFromBlockchain = async (address: string, network: Network): Promise<Connex.Thor.Account> => {
    const accountResponse = await axios.get<Connex.Thor.Account>(`${network.currentUrl}/accounts/${address}`)

    return accountResponse.data
}

const getTokenBalanceFromBlockchain = async (
    accountAddress: string,
    tokenAddress: string,
    thor: Connex.Thor,
): Promise<string | undefined> => {
    try {
        const res = await thor.account(tokenAddress).method(abis.VIP180.balanceOf).call(accountAddress)

        return res.decoded[0]
    } catch (e) {
        info(ERROR_EVENTS.TOKENS, e)
    }
}

const getFiatBalance = (balance: string, exchangeRate: number, decimals: number) => {
    const convertedBalance = BigNutils(balance).toHuman(decimals).toString

    const { value, isLeesThan_0_01 } = BigNutils().toCurrencyConversion(convertedBalance, exchangeRate)
    return isLeesThan_0_01 ? `< ${value}` : value
}

const getTokenUnitBalance = (
    balance: string,
    decimals: number,
    formatDecimals?: number,
    locale?: Intl.LocalesArgument,
) => {
    const humanized = BigNutils(balance).toHuman(decimals)
    return formatDecimals ? humanized.toTokenFormat_string(formatDecimals, locale) : humanized.toString
}

const getIsTokenWithBalance = (token: FungibleTokenWithBalance) => !new BigNumber(token.balance.balance).isZero()

export default {
    getIsTokenWithBalance,
    getBalanceFromBlockchain,
    getVetAndVthoBalancesFromBlockchain,
    getTokenBalanceFromBlockchain,
    getFiatBalance,
    getTokenUnitBalance,
    getBalanceAndTokenInfoFromBlockchain,
}
