import { createSelector } from "@reduxjs/toolkit"
import { AddressUtils } from "~Common"
import { RootState } from "~Storage/Redux/Types"
import { getAccountFungibleTokens } from "../AccountToken"

export const getBalances = (state: RootState) => state.balances

/**
 * Get all token balances for an account for the current network
 */
export const getAccountTokenBalances = createSelector(
    [getAccountFungibleTokens, getBalances],
    (accountTokens, balances) => {
        console.log("accountTokens", accountTokens)
        console.log("balances", balances)
        return accountTokens.map(accountToken => {
            const tokenBalance = balances.find(balance =>
                AddressUtils.compareAddresses(
                    balance.accountTokenId,
                    accountToken.id,
                ),
            )
            return {
                ...accountToken,
                // TODO: fix the default value
                ...(tokenBalance || {
                    accountTokenId: accountToken.id,
                    balance: "0x0",
                    timeUpdated: new Date().toISOString(),
                }),
            }
        })
    },
)
