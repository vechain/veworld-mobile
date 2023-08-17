import {
    selectSelectedAccount,
    selectSelectedNetwork,
    selectBalancesForAccount,
} from "~Storage/Redux/Selectors"
import { RootState } from "~Storage/Redux/Types"
import { Dispatch } from "@reduxjs/toolkit"
import { debug, error } from "~Utils/Logger"
import { BalanceUtils } from "~Utils"
import {
    setIsTokensOwnedLoading,
    updateTokenBalances,
} from "~Storage/Redux/Slices"
import { Balance, Network } from "~Model"
import { VET, VTHO } from "~Constants"

export const upsertTokenBalance =
    (thorClient: Connex.Thor, accountAddress: string, tokenAddress: string) =>
    async (dispatch: Dispatch, getState: () => RootState) => {
        const network = selectSelectedNetwork(getState())

        const balance = await BalanceUtils.getBalanceFromBlockchain(
            tokenAddress,
            accountAddress,
            network,
            thorClient,
        )

        if (!balance) return

        dispatch(
            updateTokenBalances({
                network: network.type,
                accountAddress,
                newBalances: [balance],
            }),
        )
    }

/**
 * Updates all balances for an account
 * @param accountAddress - the account address for this balance
 */
export const updateAccountBalances =
    (thorClient: Connex.Thor, accountAddress: string) =>
    async (dispatch: Dispatch, getState: () => RootState) => {
        dispatch(setIsTokensOwnedLoading(true))

        const accountBalances = selectBalancesForAccount(
            getState(),
            accountAddress,
        )

        if (accountBalances.length === 0) return

        debug(`Updating ${accountBalances.length} account balances`)

        const network = selectSelectedNetwork(getState())

        const balances: Balance[] = []

        try {
            for (const accountBalance of accountBalances) {
                const balance = await BalanceUtils.getBalanceFromBlockchain(
                    accountBalance.tokenAddress,
                    accountAddress,
                    network,
                    thorClient,
                )

                if (!balance) continue

                balances.push({
                    ...balance,
                })
            }
            dispatch(
                updateTokenBalances({
                    network: network.type,
                    accountAddress,
                    newBalances: balances,
                }),
            )
        } catch (e) {
            throw new Error(`Failed to get balance from external service: ${e}`)
        } finally {
            dispatch(setIsTokensOwnedLoading(false))
        }
    }

export const autoSelectSuggestTokens =
    (
        accountAddress: string,
        suggestedTokens: string[],
        network: Network,
        thorClient: Connex.Thor,
    ) =>
    async (dispatch: Dispatch) => {
        const officialTokensBalances: Balance[] = []

        try {
            for (const tokenAddress of suggestedTokens) {
                const balance = await BalanceUtils.getBalanceFromBlockchain(
                    tokenAddress,
                    accountAddress,
                    network,
                    thorClient,
                )

                if (!balance || balance.balance === "0") continue

                officialTokensBalances.push(balance)
            }

            debug(`Auto adding ${officialTokensBalances.length} token balances`)

            dispatch(
                updateTokenBalances({
                    network: network.type,
                    accountAddress,
                    newBalances: officialTokensBalances,
                }),
            )
        } catch (e) {
            throw Error(`Failed to get balances of official tokens: ${e}`)
        }
    }

export const resetTokenBalances = async (
    dispatch: Dispatch,
    getState: () => RootState,
) => {
    const account = selectSelectedAccount(getState())
    const network = selectSelectedNetwork(getState())

    const defaultTokens = [{ ...VET }, { ...VTHO }]
    if (account) {
        dispatch(
            updateTokenBalances({
                network: network.type,
                accountAddress: account.address,
                newBalances: defaultTokens.map(token => ({
                    accountAddress: account.address,
                    tokenAddress: token.address,
                    balance: "0",
                    timeUpdated: new Date().toISOString(),
                    isCustomToken: false,
                    isHidden: false,
                })),
            }),
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
