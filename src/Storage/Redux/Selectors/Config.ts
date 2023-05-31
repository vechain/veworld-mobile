import { createSelector } from "@reduxjs/toolkit"
import { RootState } from "../Types"

const reducer = (state: RootState) => state.config

export const selectUserSelectedSecurity = createSelector(reducer, state => {
    return state.userSelectedSecurity
})

export const selectLastSecuritylevel = createSelector(reducer, state => {
    return state.lastSecurityLevel
})

export const selectIsSecurityDowngrade = createSelector(reducer, state => {
    return state.isSecurityDowngrade
})

export const selectPinValidationString = createSelector(reducer, state => {
    return state.pinValidationString
})
