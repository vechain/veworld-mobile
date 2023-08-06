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

export const selectIsAppLoading = createSelector(reducer, state => {
    return state.isAppLoading
})

export const selectIsTokensOwnedLoading = createSelector(reducer, state => {
    return state.isTokensOwnedLoading
})
