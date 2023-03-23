import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { ThorConstants } from "~Common/Constant"
import { ThemeEnum } from "~Common/Enums"
import { IAccount, INetwork, NETWORK_TYPE } from "~Model"

export interface UserPreferenceState {
    theme: ThemeEnum
    currentNetwork: INetwork
    showTestNetTag: boolean
    showConversionOtherNets: boolean
    hideTokensWithNoBalance: boolean
    isAppLockActive: boolean
    selectedAccount?: IAccount
    balanceVisible: boolean
    currency: string
    language: string
}

const initialState: UserPreferenceState = {
    theme: ThemeEnum.SYSTEM,
    currentNetwork: { ...ThorConstants.makeNetwork(NETWORK_TYPE.MAIN) },
    showTestNetTag: true,
    showConversionOtherNets: true,
    hideTokensWithNoBalance: false,
    isAppLockActive: process.env.NODE_ENV !== "development",
    selectedAccount: undefined,
    balanceVisible: true,
    currency: "usd",
    language: "English",
}

export const UserPreferencesSlice = createSlice({
    name: "UserPreferences",
    initialState,
    reducers: {
        setTheme: (state, action: PayloadAction<ThemeEnum>) => {
            state.theme = action.payload
        },

        setCurrentNetwork: (state, action: PayloadAction<INetwork>) => {
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

        setSelectedAccount: (state, action: PayloadAction<IAccount>) => {
            state.selectedAccount = action.payload
        },

        setBalanceVisible: (state, action: PayloadAction<boolean>) => {
            state.balanceVisible = action.payload
        },

        setCurrency: (state, action: PayloadAction<string>) => {
            state.currency = action.payload
        },

        setLanguage: (state, action: PayloadAction<string>) => {
            state.language = action.payload
        },
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
