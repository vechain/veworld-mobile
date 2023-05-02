import { createSelector } from "@reduxjs/toolkit"
import { RootState } from "../Types"
import { ConfigSlice } from "../Slices"

const reducer = (state: RootState) => state[ConfigSlice.name]

export const selectUserSelectedSecurity = createSelector(reducer, state => {
    return state.userSelectedSecurity
})

export const selectLastSecuritylevel = createSelector(reducer, state => {
    return state.lastSecurityLevel
})

export const selectIsSecurityDowngrade = createSelector(reducer, state => {
    return state.isSecurityDowngrade
})

export const selectIsResettingApp = createSelector(reducer, state => {
    return state.isResettingApp
})

export const selectPinValidationString = createSelector(reducer, state => {
    return state.pinValidationString
})
