import {
    selectSelectedAccount,
    selectSelectedNetwork,
    selectBalancesForAccount,
    selectNetworks,
} from "~Storage/Redux/Selectors"
import { RootState } from "~Storage/Redux/Types"
import { Dispatch } from "@reduxjs/toolkit"
import { debug, error } from "~Utils/Logger"
import { BalanceUtils } from "~Utils"
import { setIsTokensOwnedLoading, updateTokenBalances } from "~Storage/Redux/Slices"
import { Balance, NETWORK_TYPE, Network } from "~Model"
import { VET, VTHO } from "~Constants"

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
 */
export const updateAccountBalances =
    (thorClient: Connex.Thor, accountAddress: string) => async (dispatch: Dispatch, getState: () => RootState) => {
        dispatch(setIsTokensOwnedLoading(true))

        const accountBalances = selectBalancesForAccount(getState(), accountAddress)

        if (accountBalances.length === 0) return

        const balancesMain: Balance[] = []
        const balancesTest: Balance[] = []

        const main = selectNetworks(getState()).find((net: Network) => net.type === NETWORK_TYPE.MAIN)
        const test = selectNetworks(getState()).find((net: Network) => net.type === NETWORK_TYPE.TEST)
        if (!main || !test) throw new Error("Networks not found")

        try {
            for (const accountBalance of accountBalances) {
                const balanceMain = await BalanceUtils.getBalanceFromBlockchain(
                    accountBalance.tokenAddress,
                    accountAddress,
                    main,
                    thorClient,
                )

                const balanceTest = await BalanceUtils.getBalanceFromBlockchain(
                    accountBalance.tokenAddress,
                    accountAddress,
                    test,
                    thorClient,
                )

                if (balanceMain) {
                    balancesMain.push({
                        ...balanceMain,
                    })
                }

                if (balanceTest) {
                    balancesTest.push({
                        ...balanceTest,
                    })
                }
            }

            dispatch(
                updateTokenBalances({
                    network: main.type,
                    accountAddress,
                    newBalances: balancesMain,
                }),
            )

            dispatch(
                updateTokenBalances({
                    network: test.type,
                    accountAddress,
                    newBalances: balancesTest,
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

export const resetTokenBalances = async (dispatch: Dispatch, getState: () => RootState) => {
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
                    position: undefined,
                })),
            }),
        )
    } else {
        error("Is not possible to init balances")
    }
}
