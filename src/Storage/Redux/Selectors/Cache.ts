import { createSelector } from "@reduxjs/toolkit"
import { RootState } from "../Types"

const reducer = (state: RootState) => state.cache

export const selectMnemonic = createSelector(reducer, state => {
    return state.mnemonic
})

export const selectNewLedgerDevice = createSelector(reducer, state => {
    return state.newLedgerDevice
})

export const selectAppLockStatus = createSelector(reducer, state => {
    return state.appLockStatus
})
