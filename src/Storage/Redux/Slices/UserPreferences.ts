import { LANGUAGE } from "./../../../Common/Enums/LanguageEnum"
import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { PURGE } from "redux-persist"
import { CURRENCY, ThemeEnum } from "~Common/Enums"
import { Account, Network, NETWORK_TYPE } from "~Model"
import { makeNetwork } from "~Common/Constant/Thor/ThorConstants"
export interface UserPreferenceState {
    theme: ThemeEnum
    currentNetwork: Network
    showTestNetTag: boolean
    showConversionOtherNets: boolean
    hideTokensWithNoBalance: boolean
    isAppLockActive: boolean
    selectedAccount?: Account
    balanceVisible: boolean
    currency: CURRENCY
    language: LANGUAGE
}

const initialState: UserPreferenceState = {
    theme: ThemeEnum.SYSTEM,
    currentNetwork: makeNetwork(NETWORK_TYPE.MAIN),
    showTestNetTag: true,
    showConversionOtherNets: true,
    hideTokensWithNoBalance: false,
    isAppLockActive: process.env.NODE_ENV !== "development",
    selectedAccount: undefined,
    balanceVisible: true,
    currency: CURRENCY.USD,
    language: LANGUAGE.ENGLISH,
}

export const UserPreferencesSlice = createSlice({
    name: "UserPreferences",
    initialState,
    reducers: {
        setTheme: (state, action: PayloadAction<ThemeEnum>) => {
            state.theme = action.payload
        },

        setCurrentNetwork: (state, action: PayloadAction<Network>) => {
            state.currentNetwork = action.payload
        },

        setShowTestNetTag: (state, action: PayloadAction<boolean>) => {
            state.showTestNetTag = action.payload
        },

        setShowConversionOtherNets: (state, action: PayloadAction<boolean>) => {
            state.showConversionOtherNets = action.payload
        },
        setHideTokensWithNoBalance: (state, action: PayloadAction<boolean>) => {
            state.hideTokensWithNoBalance = action.payload
        },

        setIsAppLockActive: (state, action: PayloadAction<boolean>) => {
            state.isAppLockActive = action.payload
        },

        setSelectedAccount: (state, action: PayloadAction<Account>) => {
            state.selectedAccount = action.payload
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
    },
    extraReducers: builder => {
        builder.addCase(PURGE, () => initialState)
    },
})

export const {
    setTheme,
    setCurrentNetwork,
    setShowTestNetTag,
    setShowConversionOtherNets,
    setHideTokensWithNoBalance,
    setIsAppLockActive,
    setSelectedAccount,
    setBalanceVisible,
    setCurrency,
    setLanguage,
} = UserPreferencesSlice.actions
