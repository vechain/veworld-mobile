import { createSelector } from "@reduxjs/toolkit"
import { RootState } from "../Types"

const reducer = (state: RootState) => state.cache

export const selectMnemonic = createSelector(reducer, state => {
    return state.mnemonic
})

export const selectAppLockStatus = createSelector(reducer, state => {
    return state.appLockStatus
})

export const selectScannedAddress = createSelector(reducer, state => {
    return state.temporaryScannedAddress
})
