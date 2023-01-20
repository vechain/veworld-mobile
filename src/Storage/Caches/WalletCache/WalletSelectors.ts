import { createSelector } from "@reduxjs/toolkit"
import { RootState } from "~Storage/Caches"

const walletStateSlice = (state: RootState) => state.walletState

export const selectMnemonic = createSelector(
    walletStateSlice,
    state => state.mnemonic,
)
