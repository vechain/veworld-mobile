import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { PURGE } from "redux-persist"
import {
    SecurityLevelType,
    TSecurityLevel,
    UserSelectedSecurityLevel,
} from "~Model"
import { SettingsConstants } from "~Common/Constant"

export interface ConfigState {
    isWalletCreated: boolean
    userSelectedSecurity: UserSelectedSecurityLevel
    lastSecurityLevel: TSecurityLevel
    isSecurityDowngrade: boolean
    isResettingApp: boolean
    pinValidationString: string
}

const initialState: ConfigState = {
    isWalletCreated: false,
    userSelectedSecurity: UserSelectedSecurityLevel.NONE,
    lastSecurityLevel: SecurityLevelType.NONE,
    isSecurityDowngrade: false,
    isResettingApp: false, // TODO - this will become obsolete once we have a fully implemented redux since we don't need a new stack anymore
    pinValidationString: SettingsConstants.VALIDATION_STRING,
}

export const ConfigSlice = createSlice({
    name: "Config",
    initialState,
    reducers: {
        setIsWalletCreated: (state, action: PayloadAction<boolean>) => {
            state.isWalletCreated = action.payload
        },

        setUserSelectedSecurity: (
            state,
            action: PayloadAction<UserSelectedSecurityLevel>,
        ) => {
            state.userSelectedSecurity = action.payload
        },

        setLastSecurityLevel: (
            state,
            action: PayloadAction<TSecurityLevel>,
        ) => {
            state.lastSecurityLevel = action.payload
        },

        setIsSecurityDowngrade: (state, action: PayloadAction<boolean>) => {
            state.isSecurityDowngrade = action.payload
        },

        setIsResettingApp: (state, action: PayloadAction<boolean>) => {
            state.isResettingApp = action.payload
        },

        setPinValidationString: (state, action: PayloadAction<string>) => {
            state.pinValidationString = action.payload
        },
    },
    extraReducers: builder => {
        builder.addCase(PURGE, () => initialState)
    },
})

export const {
    setIsWalletCreated,
    setUserSelectedSecurity,
    setLastSecurityLevel,
    setIsSecurityDowngrade,
    setIsResettingApp,
    setPinValidationString,
} = ConfigSlice.actions
