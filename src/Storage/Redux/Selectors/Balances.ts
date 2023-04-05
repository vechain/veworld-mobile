import { createSelector } from "@reduxjs/toolkit"
import { AddressUtils } from "~Common"
import { selectSelectedAccount } from "./Account"
import { VET, VTHO } from "~Common/Constant"
import {
    DenormalizedAccountTokenBalance,
    RootState,
} from "~Storage/Redux/Types"
import { selectAllFungibleTokens } from "./TokenApi"

export const selectBalancesState = (state: RootState) => state.balances

/**
 * Get all account balances
 */
export const selectAccountBalances = createSelector(
    [selectBalancesState, selectSelectedAccount],
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
export const selectDenormalizedAccountTokenBalances = createSelector(
    [selectAccountBalances, selectAllFungibleTokens],
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

/**
 * Get account token balances without vechain tokens
 */
export const selectNonVechainDenormalizedAccountTokenBalances = createSelector(
    [selectDenormalizedAccountTokenBalances],
    balances =>
        balances
            .filter(
                (balance: DenormalizedAccountTokenBalance) =>
                    balance.token.symbol !== VET.symbol &&
                    balance.token.symbol !== VTHO.symbol,
            )
            .sort(
                (
                    a: DenormalizedAccountTokenBalance,
                    b: DenormalizedAccountTokenBalance,
                ) => a.position!! - b.position!!,
            ),
)

/**
 * Get just vet balance
 */
export const getVetDenormalizedAccountTokenBalances = createSelector(
    [selectDenormalizedAccountTokenBalances],
    balances =>
        balances.find(
            (balance: DenormalizedAccountTokenBalance) =>
                balance.token.symbol === VET.symbol,
        ),
)

/**
 * Get just vtho balance
 */
export const getVthoDenormalizedAccountTokenBalances = createSelector(
    [selectDenormalizedAccountTokenBalances],
    balances =>
        balances.find(
            (balance: DenormalizedAccountTokenBalance) =>
                balance.token.symbol === VTHO.symbol,
        ),
)
