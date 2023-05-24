import { createSlice, Draft, PayloadAction } from "@reduxjs/toolkit"
import { VET, VTHO } from "~Common"
import { AddressUtils } from "~Utils"
import { Balance } from "~Model"

export type BalanceState = Balance[]

export const initialState: BalanceState = []

export const BalanceSlice = createSlice({
    name: "balances",
    initialState: initialState,
    reducers: {
        addTokenBalance: (
            state: Draft<BalanceState>,
            action: PayloadAction<Balance>,
        ) => {
            state.push(action.payload)
        },
        updateTokenBalances: (
            state: Draft<BalanceState>,
            action: PayloadAction<Balance[]>,
        ) => {
            const newBalances = action.payload
            const newState = state.filter(
                oldBalance =>
                    !newBalances.find(
                        newBalance =>
                            AddressUtils.compareAddresses(
                                newBalance.accountAddress,
                                oldBalance.accountAddress,
                            ) &&
                            AddressUtils.compareAddresses(
                                newBalance.tokenAddress,
                                oldBalance.tokenAddress,
                            ) &&
                            newBalance.genesisId === oldBalance.genesisId,
                    ),
            )
            newState.push(...newBalances)
            return newState
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
            return state
                .filter(
                    // remove deleted element
                    balance =>
                        balance.tokenAddress !== tokenAddress ||
                        balance.accountAddress !== accountAddress,
                )
                .map(balance => {
                    //recalculate positions
                    if (
                        balance.tokenAddress === tokenAddress &&
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
            action: PayloadAction<Balance[]>, // tokenBalances with updated position fields
        ) => {
            const updatedAccountBalances = action.payload
            return state.map(balance => {
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
    },
})

export const {
    addTokenBalance,
    updateTokenBalances,
    removeTokenBalance,
    changeBalancePosition,
} = BalanceSlice.actions
