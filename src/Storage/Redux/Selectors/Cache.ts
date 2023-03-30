import { createSelector } from "@reduxjs/toolkit"
import { RootState } from "../Types"

const reducer = (state: RootState) => state.cache

export const getMnemonic = createSelector(reducer, state => {
    return state.mnemonic
})

export const getAppLockStatus = createSelector(reducer, state => {
    return state.appLockStatus
})
