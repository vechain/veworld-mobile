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

export const selectBalanceVisible = createSelector(reducer, state => {
    return state.balanceVisible
})

export const selectHideTokensWithNoBalance = createSelector(reducer, state => {
    return state.hideTokensWithNoBalance
})

export const selectIsPinCodeRequired = createSelector(reducer, state => {
    return state.isPinCodeRequired
})

export const selectAnalyticsTrackingEnabled = createSelector(reducer, state => {
    return state.isAnalyticsTrackingEnabled
})

export const selectSentryTrackingEnabled = createSelector(reducer, state => {
    return state.isSentryTrackingEnabled
})
