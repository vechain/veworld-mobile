import { createSelector } from "@reduxjs/toolkit"
import { RootState } from "../Types"

const pendingState = (state: RootState) => state.pending

export const selectPendingTx = createSelector(
    [pendingState, (state: RootState, id: string) => id],
    (state, id) => {
        return state.pendingTransactions.find(tx => tx.id === id)
    },
)
