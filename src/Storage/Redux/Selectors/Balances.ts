import { createSelector } from "@reduxjs/toolkit"
import { AddressUtils } from "~Common"
import { RootState } from "~Storage/Redux/Types"
import { selectAllFungibleTokens } from "./TokenApi"
import { getSelectedAccount } from "./UserPreferences"

export const getBalances = (state: RootState) => state.balances

/**
 * Get all account balances
 */
export const getAccountBalances = createSelector(
    [getBalances, getSelectedAccount],
    (balances, account) =>
        balances.filter(balance =>
            AddressUtils.compareAddresses(
                balance.accountAddress,
                account?.address,
            ),
        ),
)

/**
 * Get all account balances with denormalized token data
 */
export const getDenormalizedAccountTokenBalances = createSelector(
    [getAccountBalances, selectAllFungibleTokens],
    (balances, tokens) =>
        balances.map(balance => {
            const balanceToken = tokens.find(token =>
                AddressUtils.compareAddresses(
                    token.address,
                    balance.tokenAddress,
                ),
            )
            if (!balanceToken) {
                throw new Error(
                    `Unable to find token with this address: ${balance.tokenAddress}`,
                )
            }
            return {
                ...balance,
                token: balanceToken,
            }
        }),
)
