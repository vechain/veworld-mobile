import { createSelector } from "@reduxjs/toolkit"
import { RootState } from "../Types"
import { CURRENCY, CURRENCY_SYMBOLS, SYMBOL_POSITIONS } from "~Constants"

const reducer = (state: RootState) => state.userPreferences

export const selectTheme = createSelector(reducer, state => {
    return state.theme
})

export const selectCurrency = createSelector(reducer, state => {
    return state.currency
})

export const selectCurrencyFormat = createSelector(reducer, state => {
    return state.currencyFormat
})

export const selectSymbolPosition = createSelector(reducer, state => {
    return state.symbolPosition || SYMBOL_POSITIONS.BEFORE
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

export const selectLanguage = createSelector(reducer, state => {
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
    return __DEV__ ? false : state.isSentryTrackingEnabled
})

export const selectAreDevFeaturesEnabled = createSelector(reducer, state => {
    return state.devFeaturesEnabled
})

export const selectLastReviewTimestamp = createSelector(reducer, state => {
    return state.lastReviewTimestamp
})

export const selectLastVersionCheck = createSelector(reducer, state => {
    return state.lastVersionCheck
})

export const selectAppResetTimestamp = createSelector(reducer, state => {
    return state.appResetTimestamp
})

export const selectLastBackupRequestTimestamp = createSelector(reducer, state => {
    return state.lastBackupRequestTimestamp
})

export const selectLastNotificationReminder = createSelector(reducer, state => {
    return state.lastNotificationReminder
})

export const selectRemovedNotificationTags = createSelector(reducer, state => {
    return state.removedNotificationTags ?? []
})

export const selectShowJailbrokeDeviceWarning = createSelector(reducer, state => {
    return state.showJailbrokeWarning
})

export const selectHideStargateBannerHomeScreen = createSelector(reducer, state => {
    return state.hideStargateBannerHomeScreen
})

export const selectHideStargateBannerVETScreen = createSelector(reducer, state => {
    return state.hideStargateBannerVETScreen
})

export const selectHideNewUserVeBetterCard = createSelector(reducer, state => {
    return state.hideNewUserVeBetterCard
})

export const selectSignKeyPair = createSelector(reducer, state => {
    return state.signKeyPair ?? { publicKey: "", privateKey: "" }
})
