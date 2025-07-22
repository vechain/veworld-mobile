import { Dispatch } from "@reduxjs/toolkit"
import { ERROR_EVENTS, VET, VTHO } from "~Constants"
import { Balance, Network } from "~Model"
import {
    selectBalancesForAccount,
    selectNetworkVBDTokens,
    selectSelectedAccount,
    selectSelectedNetwork,
} from "~Storage/Redux/Selectors"
import { setIsTokensOwnedLoading, updateTokenBalances } from "~Storage/Redux/Slices"
import { RootState } from "~Storage/Redux/Types"
import { BalanceUtils } from "~Utils"
import { debug, error } from "~Utils/Logger"

const BALANCE_UPDATE_CACHE_TIME = 5 * 60 * 1000

export const upsertTokenBalance =
    (thorClient: Connex.Thor, accountAddress: string, tokenAddress: string) =>
    async (dispatch: Dispatch, getState: () => RootState) => {
        const network = selectSelectedNetwork(getState())

        const balance = await BalanceUtils.getBalanceFromBlockchain(tokenAddress, accountAddress, network, thorClient)

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
 * @param force - Force updating the balance skipping cache time
 */
export const updateAccountBalances =
    (thorClient: Connex.Thor, accountAddress: string, force: boolean = false) =>
    async (dispatch: Dispatch, getState: () => RootState) => {
        try {
            const accountBalances = selectBalancesForAccount(getState(), accountAddress)

            const network = selectSelectedNetwork(getState())
            const updatableBalances = force
                ? accountBalances
                : accountBalances.filter(
                      balance => Date.now() - new Date(balance.timeUpdated).getTime() >= BALANCE_UPDATE_CACHE_TIME,
                  )

            if (updatableBalances.length === 0) return

            dispatch(setIsTokensOwnedLoading(true))

            const newBalances = await BalanceUtils.getMultipleBalancesFromBlockchain(
                updatableBalances.map(balance => balance.tokenAddress),
                accountAddress,
                network,
                thorClient,
            )

            if (newBalances.length === 0) return

            dispatch(
                updateTokenBalances({
                    network: network.type,
                    accountAddress,
                    newBalances,
                }),
            )
        } catch (e) {
            throw new Error(`Failed to get balance from external service: ${e}`)
        } finally {
            dispatch(setIsTokensOwnedLoading(false))
        }
    }

export const autoSelectSuggestTokens =
    (accountAddress: string, suggestedTokens: string[], network: Network, thorClient: Connex.Thor) =>
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

            debug(ERROR_EVENTS.TOKENS, `Auto adding ${officialTokensBalances.length} token balances`)

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

export const resetTokenBalances = async (dispatch: Dispatch, getState: () => RootState) => {
    const account = selectSelectedAccount(getState())
    const network = selectSelectedNetwork(getState())
    const networkVBDTokens = selectNetworkVBDTokens(getState())

    const defaultTokens = [{ ...VET }, { ...VTHO }, { ...networkVBDTokens.B3TR }, { ...networkVBDTokens.VOT3 }]
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
                    position: undefined,
                })),
            }),
        )
    } else {
        error(ERROR_EVENTS.TOKENS, "Is not possible to init balances")
    }
}
