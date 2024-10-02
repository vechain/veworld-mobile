import { LANGUAGE } from "../../../Constants/Enums/LanguageEnum"
import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import moment from "moment"
import { CURRENCY, SYMBOL_POSITIONS, ThemeEnum } from "~Constants"

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
 * @property {number} lastBackupRequestTimestamp
 */

export interface UserPreferenceState {
    theme: ThemeEnum
    hideTokensWithNoBalance: boolean
    isPinCodeRequired: boolean
    balanceVisible: boolean
    currency: CURRENCY
    symbolPosition: SYMBOL_POSITIONS
    language: LANGUAGE
    isAnalyticsTrackingEnabled: boolean
    isSentryTrackingEnabled: boolean
    devFeaturesEnabled: boolean
    lastReviewTimestamp: string
    lastVersionCheck: string
    appResetTimestamp?: string
    lastBackupRequestTimestamp?: { [key: string]: number | undefined }
}

const initialState: UserPreferenceState = {
    theme: ThemeEnum.SYSTEM,
    hideTokensWithNoBalance: false,
    isPinCodeRequired: true,
    balanceVisible: true,
    currency: CURRENCY.USD,
    symbolPosition: SYMBOL_POSITIONS.BEFORE,
    language: LANGUAGE.ENGLISH,
    isAnalyticsTrackingEnabled: true, // this is enabled by default because otherwise onboarding events won't be tracked
    isSentryTrackingEnabled: true,
    devFeaturesEnabled: __DEV__,
    // this will ask the user to review the app after 3 days the first time
    lastReviewTimestamp: moment().subtract(3, "weeks").add(3, "days").toISOString(),
    lastVersionCheck: moment().toISOString(),
    appResetTimestamp: undefined,
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

        setSymbolPosition: (state, action: PayloadAction<SYMBOL_POSITIONS>) => {
            state.symbolPosition = action.payload
        },

        setLanguage: (state, action: PayloadAction<LANGUAGE>) => {
            state.language = action.payload
        },

        setAnalyticsTrackingEnabled: (state, action: PayloadAction<boolean>) => {
            state.isAnalyticsTrackingEnabled = action.payload
        },

        setSentryTrackingEnabled: (state, action: PayloadAction<boolean>) => {
            state.isSentryTrackingEnabled = action.payload
        },

        setLastReviewTimestamp: (state, action: PayloadAction<string>) => {
            state.lastReviewTimestamp = action.payload
        },

        setLastVersionCheck: (state, action: PayloadAction<string>) => {
            state.lastVersionCheck = action.payload
        },

        setAppResetTimestamp: (state, action: PayloadAction<string | undefined>) => {
            state.appResetTimestamp = action.payload
        },

        setLastBackupRequestTimestamp: (
            state,
            action: PayloadAction<{ address: string; timestamp: number | undefined }>,
        ) => {
            if (!state.lastBackupRequestTimestamp) {
                state.lastBackupRequestTimestamp = {
                    [action.payload.address]: action.payload.timestamp,
                }
            } else {
                state.lastBackupRequestTimestamp[action.payload.address] = action.payload.timestamp
            }
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
    setSymbolPosition,
    setLanguage,
    setAnalyticsTrackingEnabled,
    setSentryTrackingEnabled,
    resetUserPreferencesState,
    setLastReviewTimestamp,
    setLastVersionCheck,
    setAppResetTimestamp,
    setLastBackupRequestTimestamp,
} = UserPreferencesSlice.actions
