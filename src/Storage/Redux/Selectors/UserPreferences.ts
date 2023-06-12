import { createSelector } from "@reduxjs/toolkit"
import { RootState } from "../Types"
import { CURRENCY, CURRENCY_SYMBOLS } from "~Constants"

const reducer = (state: RootState) => state.userPreferences

export const selectTheme = createSelector(reducer, state => {
    return state.theme
})

export const selectCurrency = createSelector(reducer, state => {
    return state.currency
})

export const selectCurrencySymbol = createSelector(selectCurrency, currency => {
    switch (currency) {
        case CURRENCY.USD:
            return CURRENCY_SYMBOLS.USD
        case CURRENCY.EUR:
            return CURRENCY_SYMBOLS.EUR
        default:
            return CURRENCY_SYMBOLS.USD
    }
})

export const selectLangauge = createSelector(reducer, state => {
    return state.language
})

export const getBalanceVisible = createSelector(reducer, state => {
    return state.balanceVisible
})

export const selectHideTokensWithNoBalance = createSelector(reducer, state => {
    return state.hideTokensWithNoBalance
})

export const selectIsAppLockActive = createSelector(reducer, state => {
    return state.isAppLockActive
})

export const selectAnalyticsTrackingEnabled = createSelector(reducer, state => {
    return state.isAnalyticsTrackingEnabled
})
