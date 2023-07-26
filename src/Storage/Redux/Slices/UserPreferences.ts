import { LANGUAGE } from "../../../Constants/Enums/LanguageEnum"
import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { CURRENCY, ThemeEnum } from "~Constants"

/**
 * @typedef {Object} UserPreferenceState
 * @property {ThemeEnum} theme
 * @property {boolean} hideTokensWithNoBalance
 * @property {boolean} isPinCodeRequired - whether the pin code is required to decrypt the wallets. Pin code will be stored in the PinCodeProvider if not.
 * @property {boolean} balanceVisible
 * @property {CURRENCY} currency
 * @property {LANGUAGE} language
 * @property {boolean} isAnalyticsTrackingEnabled
 * @property {boolean} isSentryTrackingEnabled
 */
export interface UserPreferenceState {
    theme: ThemeEnum
    hideTokensWithNoBalance: boolean
    isPinCodeRequired: boolean
    balanceVisible: boolean
    currency: CURRENCY
    language: LANGUAGE
    isAnalyticsTrackingEnabled: boolean
    isSentryTrackingEnabled: boolean
}

const initialState: UserPreferenceState = {
    theme: ThemeEnum.SYSTEM,
    hideTokensWithNoBalance: false,
    isPinCodeRequired: true,
    balanceVisible: true,
    currency: CURRENCY.USD,
    language: LANGUAGE.ENGLISH,
    isAnalyticsTrackingEnabled: false,
    isSentryTrackingEnabled: true,
}

export const UserPreferencesSlice = createSlice({
    name: "userPreferences",
    initialState,
    reducers: {
        setTheme: (state, action: PayloadAction<ThemeEnum>) => {
            state.theme = action.payload
        },

        setHideTokensWithNoBalance: (state, action: PayloadAction<boolean>) => {
            state.hideTokensWithNoBalance = action.payload
        },

        setIsPinCodeRequired: (state, action: PayloadAction<boolean>) => {
            state.isPinCodeRequired = action.payload
        },

        setBalanceVisible: (state, action: PayloadAction<boolean>) => {
            state.balanceVisible = action.payload
        },

        setCurrency: (state, action: PayloadAction<CURRENCY>) => {
            state.currency = action.payload
        },

        setLanguage: (state, action: PayloadAction<LANGUAGE>) => {
            state.language = action.payload
        },

        setAnalyticsTrackingEnabled: (
            state,
            action: PayloadAction<boolean>,
        ) => {
            state.isAnalyticsTrackingEnabled = action.payload
        },

        setSentryTrackingEnabled: (state, action: PayloadAction<boolean>) => {
            state.isSentryTrackingEnabled = action.payload
        },

        resetUserPreferencesState: () => initialState,
    },
})

export const {
    setTheme,
    setHideTokensWithNoBalance,
    setIsPinCodeRequired,
    setBalanceVisible,
    setCurrency,
    setLanguage,
    setAnalyticsTrackingEnabled,
    setSentryTrackingEnabled,
    resetUserPreferencesState,
} = UserPreferencesSlice.actions
