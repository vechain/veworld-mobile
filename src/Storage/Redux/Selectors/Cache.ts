import { createSelector } from "@reduxjs/toolkit"
import { RootState } from "../Types"
import { CacheSlice } from "../Slices"

const reducer = (state: RootState) => state[CacheSlice.name]

export const selectMnemonic = createSelector(reducer, state => {
    return state.mnemonic
})

export const selectAppLockStatus = createSelector(reducer, state => {
    return state.appLockStatus
})
