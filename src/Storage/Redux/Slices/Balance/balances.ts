import { createSlice, Draft, PayloadAction } from "@reduxjs/toolkit"
import { BalanceState, TokenBalance } from "./types"

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
        addTokenBalances: (
            state: Draft<BalanceState>,
            action: PayloadAction<TokenBalance[]>,
        ) => {
            state.push(...action.payload)
        },
        setTokenBalances: (
            state: Draft<BalanceState>,
            action: PayloadAction<TokenBalance[]>,
        ) => {
            return action.payload
        },
    },
})

export const { addTokenBalance, addTokenBalances, setTokenBalances } =
    BalanceSlice.actions
