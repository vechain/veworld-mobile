import { LANGUAGE } from "./../../../Common/Enums/LanguageEnum"
import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { PURGE } from "redux-persist"
import { CURRENCY, ThemeEnum } from "~Common/Enums"
export interface UserPreferenceState {
    theme: ThemeEnum
    hideTokensWithNoBalance: boolean
    isAppLockActive: boolean
    balanceVisible: boolean
    currency: CURRENCY
    language: LANGUAGE
    isAnalyticsTrackingEnabled: boolean
}

const initialState: UserPreferenceState = {
    theme: ThemeEnum.SYSTEM,
    hideTokensWithNoBalance: false,
    isAppLockActive: process.env.NODE_ENV !== "development",
    balanceVisible: true,
    currency: CURRENCY.USD,
    language: LANGUAGE.ENGLISH,
    isAnalyticsTrackingEnabled: false,
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
    },
    extraReducers: builder => {
        builder.addCase(PURGE, () => initialState)
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
} = UserPreferencesSlice.actions
