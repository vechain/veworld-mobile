import {
    selectAccountBalances,
    selectSelectedAccount,
    selectSelectedNetwork,
} from "~Storage/Redux/Selectors"
import { RootState, TokenBalance } from "~Storage/Redux/Types"
import { Dispatch } from "@reduxjs/toolkit"
import { AddressUtils, error } from "~Common"
import { DEFAULT_VECHAIN_TOKENS_MAP, VET, VTHO } from "~Common/Constant"
import axios from "axios"
import { abis } from "~Common/Constant/Thor/ThorConstants"
import { updateTokenBalances } from "~Storage/Redux/Slices"

/**
 * Updates all balances for an account
 * @param accountAddress - the acccount address for this balance
 */
export const updateAccountBalances =
    (thorClient: Connex.Thor) =>
    async (dispatch: Dispatch, getState: () => RootState) => {
        const accountBalances = selectAccountBalances(getState())
        const network = selectSelectedNetwork(getState())
        const balances: TokenBalance[] = []
        try {
            for (const accountBalance of accountBalances) {
                let balance: string

                if (
                    AddressUtils.compareAddresses(
                        accountBalance.tokenAddress,
                        VET.address,
                    ) ||
                    AddressUtils.compareAddresses(
                        accountBalance.tokenAddress,
                        VTHO.address,
                    )
                ) {
                    const accountResponse =
                        await axios.get<Connex.Thor.Account>(
                            `${network.currentUrl}/accounts/${accountBalance.accountAddress}`,
                        )
                    if (
                        AddressUtils.compareAddresses(
                            accountBalance.tokenAddress,
                            VET.address,
                        )
                    ) {
                        balance = accountResponse.data.balance
                    } else {
                        balance = accountResponse.data.energy
                    }
                } else {
                    const res = await thorClient
                        .account(accountBalance.tokenAddress)
                        .method(abis.vip180.balanceOf)
                        .call(accountBalance.accountAddress)

                    balance = res.decoded[0]
                }

                balances.push({
                    accountAddress: accountBalance.accountAddress,
                    tokenAddress: accountBalance.tokenAddress,
                    balance,
                    timeUpdated: new Date().toISOString(),
                    position: accountBalance.position,
                    networkGenesisId: network.genesis.id,
                })
            }
            dispatch(updateTokenBalances(balances))
        } catch (e) {
            throw new Error("Failed to get balance from external service")
        }
    }

export const resetTokenBalances = async (
    dispatch: Dispatch,
    getState: () => RootState,
) => {
    const account = selectSelectedAccount(getState())
    const network = selectSelectedNetwork(getState())

    const defaultTokens = DEFAULT_VECHAIN_TOKENS_MAP.get(network.type)
    if (account) {
        dispatch(
            updateTokenBalances(
                defaultTokens!!.map(token => ({
                    accountAddress: account.address,
                    tokenAddress: token.address,
                    balance: "0",
                    timeUpdated: new Date().toISOString(),
                    networkGenesisId: network.genesis.id,
                })),
            ),
        )
    } else {
        error(
            "Is not possible to init balances for account:",
            account,
            "and network:",
            network,
        )
    }
}
