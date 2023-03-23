import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { ThorConstants } from "~Common/Constant"
import { IAccount, INetwork, NETWORK_TYPE } from "~Model"

export interface UserPreferenceState {
    theme: "dark" | "light"
    currentNetwork: INetwork
    showTestNetTag: boolean
    showConversionOtherNets: boolean
    isAppLockActive: boolean
    selectedAccount?: IAccount
    balanceVisible: boolean
}

const initialState: UserPreferenceState = {
    theme: "light",
    currentNetwork: { ...ThorConstants.makeNetwork(NETWORK_TYPE.MAIN) },
    showTestNetTag: true,
    showConversionOtherNets: true,
    isAppLockActive: process.env.NODE_ENV !== "development",
    selectedAccount: undefined,
    balanceVisible: true,
}

export const UserPreferencesSlice = createSlice({
    name: "UserPreferences",
    initialState,
    reducers: {
        setTheme: (state, action: PayloadAction<"dark" | "light">) => {
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

        setIsAppLockActive: (state, action: PayloadAction<boolean>) => {
            state.isAppLockActive = action.payload
        },

        setSelectedAccount: (state, action: PayloadAction<IAccount>) => {
            state.selectedAccount = action.payload
        },

        setBalanceVisible: (state, action: PayloadAction<boolean>) => {
            state.balanceVisible = action.payload
        },
    },
})

export const {
    setTheme,
    setCurrentNetwork,
    setShowTestNetTag,
    setShowConversionOtherNets,
    setIsAppLockActive,
    setSelectedAccount,
    setBalanceVisible,
} = UserPreferencesSlice.actions
