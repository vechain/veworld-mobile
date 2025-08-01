import { abis, ERROR_EVENTS, VET, VTHO } from "~Constants"
import axios from "axios"
import { error, info } from "~Utils/Logger"
import { Balance, FungibleTokenWithBalance, Network } from "~Model"
import AddressUtils from "../AddressUtils"
import { getTokenDecimals, getTokenName, getTokenSymbol } from "~Networking"
import { BigNumber } from "bignumber.js"
import BigNutils from "~Utils/BigNumberUtils"
import { ethers } from "ethers"
import { VIP180 } from "~Constants/Constants/Thor/abis"

const vip180Interface = new ethers.utils.Interface([VIP180.balanceOf])

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

const getErc20BalancesFromBlockchain = async (tokenAddresses: string[], accountAddress: string, thor: Connex.Thor) => {
    const clauses = tokenAddresses.map(token =>
        thor.account(token).method(abis.VIP180.balanceOf).asClause(accountAddress),
    )

    const result = await thor.explain(clauses).caller(accountAddress).execute()

    const nowIso = new Date().toISOString()

    return result.flatMap((res, idx) => {
        // skip clauses that obviously failed
        if (res.reverted || res.data === "0x" || res.data.length < 10) return []

        const [raw] = vip180Interface.decodeFunctionResult("balanceOf", res.data)
        return [
            {
                balance: (raw as ethers.BigNumber).toHexString(),
                tokenAddress: tokenAddresses[idx],
                timeUpdated: nowIso,
                isHidden: false,
            },
        ]
    })
}

const getNativeBalancesFromBlockchain = async (accountAddress: string, network: Network) => {
    const result = await getVetAndVthoBalancesFromBlockchain(accountAddress, network)
    return [
        {
            tokenAddress: VET.address,
            timeUpdated: new Date().toISOString(),
            balance: result.balance,
            isHidden: false,
        },
        {
            tokenAddress: VTHO.address,
            timeUpdated: new Date().toISOString(),
            balance: result.energy,
            isHidden: false,
        },
    ]
}

const getBalancesFromBlockchain = async (
    tokenAddresses: string[],
    accountAddress: string,
    network: Network,
    thor: Connex.Thor,
): Promise<Balance[]> => {
    try {
        // Check if VET or VTHO is in the balances to update
        const vetOrVthoInAddresses = tokenAddresses.find(
            addr =>
                AddressUtils.compareAddresses(addr, VET.address) || AddressUtils.compareAddresses(addr, VTHO.address),
        )
        const notVetOrVtho = tokenAddresses.filter(
            addr =>
                !AddressUtils.compareAddresses(addr, VET.address) && !AddressUtils.compareAddresses(addr, VTHO.address),
        )
        const balances: Balance[] = []
        if (vetOrVthoInAddresses) {
            const result = await getNativeBalancesFromBlockchain(accountAddress, network)
            balances.push(...result)
        }
        if (notVetOrVtho.length === 0) return balances
        const erc20Balances = await getErc20BalancesFromBlockchain(notVetOrVtho, accountAddress, thor)
        return balances.concat(erc20Balances)
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
        info(ERROR_EVENTS.TOKENS, tokenAddress, e)
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
    getBalancesFromBlockchain,
}
