import { createSlice, PayloadAction } from "@reduxjs/toolkit"

type PendingTransaction = {
    txId: string
    id: string
}

export interface PendingSlice {
    pendingTransactions: PendingTransaction[]
}

const initialState: PendingSlice = {
    pendingTransactions: [],
}

export const PendingSlice = createSlice({
    name: "pending",
    initialState,
    reducers: {
        setPendingTransaction: (
            state,
            action: PayloadAction<{
                txId: string
                id: string
            }>,
        ) => {
            const foundIndex = state.pendingTransactions.findIndex(
                tx => tx.txId === action.payload.txId,
            )
            if (foundIndex === -1)
                state.pendingTransactions.push(action.payload)

            return state
        },

        removePendingTransaction: (
            state,
            action: PayloadAction<{
                txId: string
            }>,
        ) => {
            const foundIndex = state.pendingTransactions.findIndex(
                tx => tx.txId === action.payload.txId,
            )
            if (foundIndex !== -1)
                state.pendingTransactions.splice(foundIndex, 1)

            return state
        },

        resetPendingState: () => {
            return initialState
        },
    },
})

export const {
    setPendingTransaction,
    removePendingTransaction,
    resetPendingState,
} = PendingSlice.actions
