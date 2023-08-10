import { createSlice, Draft, PayloadAction } from "@reduxjs/toolkit"
import { VET, VTHO } from "~Constants"
import { AddressUtils } from "~Utils"
import { Balance } from "~Model"

export type BalanceState = Record<string, Balance[]>

export const initialState: BalanceState = {}

export const BalanceSlice = createSlice({
    name: "balances",
    initialState: initialState,
    reducers: {
        addTokenBalance: (
            state: Draft<BalanceState>,
            action: PayloadAction<{ accountAddress: string; balance: Balance }>,
        ) => {
            const { accountAddress, balance } = action.payload

            if (!state[accountAddress]) {
                state[accountAddress] = []
            }

            state[accountAddress].push(balance)
        },
        upsertTokenBalances: (
            state: Draft<BalanceState>,
            action: PayloadAction<{
                accountAddress: string
                newBalances: Balance[]
            }>,
        ) => {
            const { accountAddress, newBalances } = action.payload

            if (!state[accountAddress]) {
                state[accountAddress] = []
            }

            const existingBalances = state[accountAddress]

            // Remove existing balances from newBalances
            const filteredNewBalances = newBalances.filter(
                newBalance =>
                    !existingBalances.find(
                        existingBalance =>
                            AddressUtils.compareAddresses(
                                existingBalance.tokenAddress,
                                newBalance.tokenAddress,
                            ) &&
                            existingBalance.genesisId === newBalance.genesisId,
                    ),
            )

            // Add new balances
            existingBalances.push(...filteredNewBalances)
        },
        updateTokenBalances: (
            state: Draft<BalanceState>,
            action: PayloadAction<{
                accountAddress: string
                newBalances: Balance[]
            }>,
        ) => {
            const { accountAddress, newBalances } = action.payload

            if (!state[accountAddress]) {
                state[accountAddress] = []
            }

            state[accountAddress] = state[accountAddress].map(oldBalance => {
                const newBalance = newBalances.find(
                    _newBalance =>
                        AddressUtils.compareAddresses(
                            _newBalance.tokenAddress,
                            oldBalance.tokenAddress,
                        ) && _newBalance.genesisId === oldBalance.genesisId,
                )

                return newBalance ? newBalance : oldBalance
            })
        },
        removeTokenBalance: (
            state: Draft<BalanceState>,
            action: PayloadAction<{
                accountAddress: string
                tokenAddress: string
            }>,
        ) => {
            const { accountAddress, tokenAddress } = action.payload

            let position = 0
            state[accountAddress] = state[accountAddress]
                .filter(
                    // remove deleted element
                    balance =>
                        balance.tokenAddress !== tokenAddress ||
                        balance.accountAddress !== accountAddress,
                )
                .map(balance => {
                    //recalculate positions
                    if (
                        balance.accountAddress === accountAddress &&
                        !AddressUtils.compareAddresses(
                            balance.tokenAddress,
                            VET.address,
                        ) &&
                        !AddressUtils.compareAddresses(
                            balance.tokenAddress,
                            VTHO.address,
                        )
                    ) {
                        const newBalance = {
                            ...balance,
                            position,
                        }
                        position++
                        return newBalance
                    }
                    return balance
                })
        },

        changeBalancePosition: (
            state: Draft<BalanceState>,
            action: PayloadAction<{
                accountAddress: string
                updatedAccountBalances: Balance[]
            }>,
        ) => {
            const { accountAddress, updatedAccountBalances } = action.payload

            if (!state[accountAddress]) {
                state[accountAddress] = []
            }

            state[accountAddress] = state[accountAddress].map(balance => {
                const updatedBalance = updatedAccountBalances.find(
                    updatedAccountBalance =>
                        balance.tokenAddress ===
                            updatedAccountBalance.tokenAddress &&
                        balance.accountAddress ===
                            updatedAccountBalance.accountAddress,
                )

                return updatedBalance ? updatedBalance : balance
            })
        },

        resetBalancesState: () => initialState,
    },
})

export const {
    addTokenBalance,
    upsertTokenBalances,
    updateTokenBalances,
    removeTokenBalance,
    changeBalancePosition,
    resetBalancesState,
} = BalanceSlice.actions
