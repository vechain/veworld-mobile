import { createSelector } from "@reduxjs/toolkit"
import { RootState } from "../Types"

const reducer = (state: RootState) => state.userPreferences

export const selectTheme = createSelector(reducer, state => {
    return state.theme
})

export const selectCurrency = createSelector(reducer, state => {
    return state.currency
})

export const selectLangauge = createSelector(reducer, state => {
    return state.language
})

export const selectHideTokensWithNoBalance = createSelector(reducer, state => {
    return state.hideTokensWithNoBalance
})

export const getCurrentNetwork = createSelector(reducer, state => {
    return state.currentNetwork
})

export const getSelectedAccount = createSelector(reducer, state => {
    return state.selectedAccount
})
