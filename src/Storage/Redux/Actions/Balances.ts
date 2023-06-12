import {
    selectSelectedAccount,
    selectSelectedNetwork,
    selectAccountBalances,
} from "~Storage/Redux/Selectors"
import { RootState } from "~Storage/Redux/Types"
import { Dispatch } from "@reduxjs/toolkit"
import { error } from "~Utils/Logger"
import { BalanceUtils } from "~Utils"
import { DEFAULT_VECHAIN_TOKENS_MAP } from "~Constants"
import { updateTokenBalances, upsertTokenBalances } from "~Storage/Redux/Slices"
import { Balance } from "~Model"

/**
 * Updates all balances for an account
 * @param accountAddress - the acccount address for this balance
 */
export const updateAccountBalances =
    (thorClient: Connex.Thor, accountAddress: string) =>
    async (dispatch: Dispatch, getState: () => RootState) => {
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

                balances.push({
                    ...balance,

                    position: accountBalance.position,
                })
            }
            dispatch(updateTokenBalances(balances))
        } catch (e) {
            throw new Error(`Failed to get balance from external service: ${e}`)
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
            upsertTokenBalances(
                defaultTokens!!.map(token => ({
                    accountAddress: account.address,
                    tokenAddress: token.address,
                    balance: "0",
                    timeUpdated: new Date().toISOString(),
                    genesisId: network.genesis.id,
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
