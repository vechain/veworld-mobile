import { createSlice, Draft, PayloadAction } from "@reduxjs/toolkit"
import { VET, VTHO } from "~Common"
import { BalanceState, TokenBalance } from "../Types/Balances"

export const initialState: BalanceState = []

export const BalanceSlice = createSlice({
    name: "balances",
    initialState: initialState,
    reducers: {
        addTokenBalance: (
            state: Draft<BalanceState>,
            action: PayloadAction<TokenBalance>,
        ) => {
            state.push(action.payload)
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
                        balance.accountAddress !== VET.address &&
                        balance.accountAddress !== VTHO.address
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
            action: PayloadAction<TokenBalance[]>, // tokenBalances with updated position fields
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
        setTokenBalances: (
            state: Draft<BalanceState>,
            action: PayloadAction<TokenBalance[]>,
        ) => {
            return action.payload
        },
    },
})

export const {
    addTokenBalance,
    setTokenBalances,
    removeTokenBalance,
    changeBalancePosition,
} = BalanceSlice.actions
