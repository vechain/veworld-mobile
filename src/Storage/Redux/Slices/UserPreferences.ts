import { LANGUAGE } from "../../../Constants/Enums/LanguageEnum"
import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { CURRENCY, ThemeEnum } from "~Constants"
export interface UserPreferenceState {
    theme: ThemeEnum
    hideTokensWithNoBalance: boolean
    isAppLockActive: boolean
    balanceVisible: boolean
    currency: CURRENCY
    language: LANGUAGE
    isAnalyticsTrackingEnabled: boolean
    isSentryTrackingEnabled: boolean
}

const initialState: UserPreferenceState = {
    theme: ThemeEnum.SYSTEM,
    hideTokensWithNoBalance: false,
    isAppLockActive: process.env.NODE_ENV !== "development",
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

        setIsAppLockActive: (state, action: PayloadAction<boolean>) => {
            state.isAppLockActive = action.payload
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
    setIsAppLockActive,
    setBalanceVisible,
    setCurrency,
    setLanguage,
    setAnalyticsTrackingEnabled,
    setSentryTrackingEnabled,
    resetUserPreferencesState,
} = UserPreferencesSlice.actions
