import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import lodash from "lodash"
import moment from "moment"
import { CURRENCY, CURRENCY_FORMATS, SYMBOL_POSITIONS, ThemeEnum } from "~Constants/Enums"
import { Locales } from "~i18n"
import { KeyPair } from "./ExternalDapps"

/**
 * @typedef {Object} UserPreferenceState
 * @property {ThemeEnum} theme
 * @property {boolean} hideTokensWithNoBalance
 * @property {boolean} isPinCodeRequired - whether the pin code is required to decrypt the wallets. Pin code will be stored in the PinCodeProvider if not.
 * @property {boolean} balanceVisible
 * @property {CURRENCY} currency
 * @property {SYMBOL_POSITIONS} symbolPosition
 * @property {LANGUAGE} language
 * @property {boolean} isAnalyticsTrackingEnabled
 * @property {boolean} isSentryTrackingEnabled
 * @property {boolean} devFeaturesEnabled
 * @property {string} lastReviewTimestamp
 * @property {string} lastVersionCheck
 * @property {string|number} appResetTimestamp
 * @property {Object.<string, number>|undefined} lastBackupRequestTimestamp
 * @property {number|null} lastNotificationReminder
 * @property {string[]} removedNotificationTags
 * @property {KeyPair|undefined} signKeyPair - Key pair for signing session tokens for external dapps connections
 * @property {boolean} hideStellaPayBottomSheet - Whether to hide the Stella Pay bottom sheet
 */

export interface UserPreferenceState {
    theme: ThemeEnum
    hideTokensWithNoBalance: boolean
    isPinCodeRequired: boolean
    balanceVisible: boolean
    currency: CURRENCY
    currencyFormat: CURRENCY_FORMATS
    symbolPosition: SYMBOL_POSITIONS
    language: Locales
    isAnalyticsTrackingEnabled: boolean
    isSentryTrackingEnabled: boolean
    devFeaturesEnabled: boolean
    lastReviewTimestamp: string
    lastVersionCheck: string
    appResetTimestamp?: string
    lastBackupRequestTimestamp?: { [key: string]: number | undefined }
    lastNotificationReminder: number | null
    removedNotificationTags?: string[]
    showJailbrokeWarning?: boolean
    hideStargateBannerHomeScreen?: boolean
    hideStargateBannerVETScreen?: boolean
    hideNewUserVeBetterCard?: boolean
    hideStargateXVeBetterBanner?: boolean
    signKeyPair?: KeyPair
    notificationCenterUrl?: string
    developerMenuUnlocked?: boolean
    /**
     * Indexer URLs.
     * Each key is a genesis id and value is the URL.
     * If an indexer isn't defined here, look up to the .env, otherwise return undefined
     */
    indexerUrls?: {
        [genesisId: string]: string
    }
    hideStellaPayBottomSheet?: boolean
    /**
     * Indicate that the user explicitly accepts to go to apps that are not on app hub.
     * By default it's false.
     */
    developerAppsEnabled?: boolean
}

export const initialUserPreferencesState: UserPreferenceState = {
    theme: ThemeEnum.SYSTEM,
    hideTokensWithNoBalance: false,
    isPinCodeRequired: true,
    balanceVisible: true,
    currency: CURRENCY.USD,
    currencyFormat: CURRENCY_FORMATS.SYSTEM,
    symbolPosition: SYMBOL_POSITIONS.BEFORE,
    language: "en" as Locales,
    isAnalyticsTrackingEnabled: true, // this is enabled by default because otherwise onboarding events won't be tracked
    isSentryTrackingEnabled: true,
    devFeaturesEnabled: __DEV__,
    // this will ask the user to review the app after 3 days the first time
    lastReviewTimestamp: moment().subtract(3, "weeks").add(3, "days").toISOString(),
    lastVersionCheck: moment().toISOString(),
    appResetTimestamp: undefined,
    lastNotificationReminder: null,
    removedNotificationTags: undefined,
    showJailbrokeWarning: true,
    hideStargateBannerHomeScreen: false,
    hideStargateBannerVETScreen: false,
    hideNewUserVeBetterCard: false,
    signKeyPair: undefined,
    notificationCenterUrl: undefined,
    developerMenuUnlocked: false,
    hideStellaPayBottomSheet: false,
    hideStargateXVeBetterBanner: false,
}

export const UserPreferencesSlice = createSlice({
    name: "userPreferences",
    initialState: initialUserPreferencesState,
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

        setCurrencyFormat: (state, action: PayloadAction<CURRENCY_FORMATS>) => {
            state.currencyFormat = action.payload
        },

        setSymbolPosition: (state, action: PayloadAction<SYMBOL_POSITIONS>) => {
            state.symbolPosition = action.payload
        },

        setLanguage: (state, action: PayloadAction<Locales>) => {
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

        resetUserPreferencesState: state => {
            if (state.language !== "en") {
                const selectedLanguage = state.language
                state = lodash.cloneDeep(initialUserPreferencesState)
                state.language = selectedLanguage
                return
            }

            return initialUserPreferencesState
        },

        updateLastNotificationReminder: (state, action: PayloadAction<number | null>) => {
            state.lastNotificationReminder = action.payload
        },

        setShowJailbrokeDeviceWarning: (state, action: PayloadAction<boolean>) => {
            state.showJailbrokeWarning = action.payload
        },

        addRemovedNotificationTag: (state, action: PayloadAction<string>) => {
            if (!state.removedNotificationTags) {
                state.removedNotificationTags = [action.payload]
            } else if (!state.removedNotificationTags.includes(action.payload)) {
                state.removedNotificationTags.push(action.payload)
            }
        },

        removeRemovedNotificationTag: (state, action: PayloadAction<string>) => {
            if (state.removedNotificationTags?.includes(action.payload)) {
                state.removedNotificationTags = state.removedNotificationTags.filter(tag => tag !== action.payload)
            }
        },

        setHideStargateBannerHomeScreen: (state, action: PayloadAction<boolean>) => {
            state.hideStargateBannerHomeScreen = action.payload
        },

        setHideStargateBannerVETScreen: (state, action: PayloadAction<boolean>) => {
            state.hideStargateBannerVETScreen = action.payload
        },

        setHideNewUserVeBetterCard: (state, action: PayloadAction<boolean>) => {
            state.hideNewUserVeBetterCard = action.payload
        },

        setHideStargateXVeBetterBanner: (state, action: PayloadAction<boolean>) => {
            state.hideStargateXVeBetterBanner = action.payload
        },

        setSignKeyPair: (state, action: PayloadAction<KeyPair>) => {
            state.signKeyPair = action.payload
        },

        setNotificationCenterUrl: (state, action: PayloadAction<string | undefined>) => {
            state.notificationCenterUrl = action.payload
        },

        setDeveloperMenuUnlocked: (state, action: PayloadAction<boolean>) => {
            state.developerMenuUnlocked = action.payload
        },

        setIndexerUrl: (state, action: PayloadAction<{ genesisId: string; url: string | undefined }>) => {
            const { genesisId, url } = action.payload
            state.indexerUrls ??= {}
            if (url) state.indexerUrls[genesisId] = url
            else delete state.indexerUrls[genesisId]
        },
        setHideStellaPayBottomSheet: (state, action: PayloadAction<boolean>) => {
            state.hideStellaPayBottomSheet = action.payload
        },
        setDeveloperAppsEnabled: (state, action: PayloadAction<boolean>) => {
            state.developerAppsEnabled = action.payload
        },
    },
})

export const {
    setTheme,
    setHideTokensWithNoBalance,
    setIsPinCodeRequired,
    setBalanceVisible,
    setCurrency,
    setCurrencyFormat,
    setSymbolPosition,
    setLanguage,
    setAnalyticsTrackingEnabled,
    setSentryTrackingEnabled,
    resetUserPreferencesState,
    setLastReviewTimestamp,
    setLastVersionCheck,
    setAppResetTimestamp,
    setLastBackupRequestTimestamp,
    updateLastNotificationReminder,
    addRemovedNotificationTag,
    removeRemovedNotificationTag,
    setShowJailbrokeDeviceWarning,
    setHideStargateBannerHomeScreen,
    setHideStargateBannerVETScreen,
    setHideNewUserVeBetterCard,
    setHideStargateXVeBetterBanner,
    setSignKeyPair,
    setNotificationCenterUrl,
    setDeveloperMenuUnlocked,
    setIndexerUrl,
    setHideStellaPayBottomSheet,
    setDeveloperAppsEnabled,
} = UserPreferencesSlice.actions
