import {
    selectSelectedAccount,
    selectSelectedNetwork,
    selectAccountBalances,
    selectFungibleTokens,
} from "~Storage/Redux/Selectors"
import { RootState } from "~Storage/Redux/Types"
import { Dispatch } from "@reduxjs/toolkit"
import { error } from "~Utils/Logger"
import { BalanceUtils } from "~Utils"
import { DEFAULT_VECHAIN_TOKENS_MAP } from "~Constants"
import {
    setHasFetchedOfficialTokensMainnet,
    setHasFetchedOfficialTokensTestnet,
    setIsTokensOwnedLoading,
    updateTokenBalances,
    upsertTokenBalances,
} from "~Storage/Redux/Slices"
import { Balance, NETWORK_TYPE } from "~Model"

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
            upsertTokenBalances({ accountAddress, newBalances: [balance] }),
        )
    }

/**
 * Updates all balances for an account
 * @param accountAddress - the acccount address for this balance
 */
export const updateAccountBalances =
    (thorClient: Connex.Thor, accountAddress: string) =>
    async (dispatch: Dispatch, getState: () => RootState) => {
        dispatch(setIsTokensOwnedLoading(true))

        const accountBalances = selectAccountBalances(
            getState(),
            accountAddress,
        )

        const network = selectSelectedNetwork(getState())

        const balances: Balance[] = []

        try {
            for (const accountBalance of accountBalances) {
                const balance = await BalanceUtils.getBalanceFromBlockchain(
                    accountBalance.tokenAddress,
                    accountBalance.accountAddress,
                    network,
                    thorClient,
                )

                if (!balance) continue

                balances.push({
                    ...balance,

                    position: accountBalance.position,
                })
            }
            dispatch(
                updateTokenBalances({
                    accountAddress,
                    newBalances: balances,
                }),
            )

            dispatch(setIsTokensOwnedLoading(false))
        } catch (e) {
            dispatch(setIsTokensOwnedLoading(false))
            throw new Error(`Failed to get balance from external service: ${e}`)
        }
    }

export const updateOfficialTokensBalances =
    (thorClient: Connex.Thor, accountAddress: string) =>
    async (dispatch: Dispatch, getState: () => RootState) => {
        dispatch(setIsTokensOwnedLoading(true))

        const network = selectSelectedNetwork(getState())

        const officialTokens = selectFungibleTokens(getState())

        const officialTokensBalances: Balance[] = []

        try {
            for (const officialToken of officialTokens) {
                const balance = await BalanceUtils.getBalanceFromBlockchain(
                    officialToken.address,
                    accountAddress,
                    network,
                    thorClient,
                )

                if (!balance || balance.balance === "0") continue

                officialTokensBalances.push(balance)
            }

            dispatch(
                upsertTokenBalances({
                    accountAddress,
                    newBalances: officialTokensBalances,
                }),
            )

            network.type === NETWORK_TYPE.MAIN
                ? dispatch(
                      setHasFetchedOfficialTokensMainnet({
                          accountAddress,
                          hasFetched: true,
                      }),
                  )
                : dispatch(
                      setHasFetchedOfficialTokensTestnet({
                          accountAddress,
                          hasFetched: true,
                      }),
                  )

            dispatch(setIsTokensOwnedLoading(false))
        } catch (e) {
            dispatch(setIsTokensOwnedLoading(false))
            throw new Error(`Failed to get balances of official tokens: ${e}`)
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
            upsertTokenBalances({
                accountAddress: account.address,
                newBalances: defaultTokens!!.map(token => ({
                    accountAddress: account.address,
                    tokenAddress: token.address,
                    balance: "0",
                    timeUpdated: new Date().toISOString(),
                    genesisId: network.genesis.id,
                    isCustomToken: false,
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
