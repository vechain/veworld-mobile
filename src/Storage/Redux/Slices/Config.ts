import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { PURGE } from "redux-persist"
import {
    SecurityLevelType,
    TSecurityLevel,
    UserSelectedSecurityLevel,
    WALLET_STATUS,
} from "~Model"
import { SettingsConstants } from "~Common/Constant"

export interface ConfigState {
    userSelectedSecurity: UserSelectedSecurityLevel
    lastSecurityLevel: TSecurityLevel
    isSecurityDowngrade: boolean
    isResettingApp: boolean
    pinValidationString: string
    mnemonic?: string
    appLockStatus: WALLET_STATUS
}

const initialState: ConfigState = {
    userSelectedSecurity: UserSelectedSecurityLevel.NONE,
    lastSecurityLevel: SecurityLevelType.NONE,
    isSecurityDowngrade: false,
    isResettingApp: false, // TODO - this will become obsolete once we have a fully implemented redux since we don't need a new stack anymore
    pinValidationString: SettingsConstants.VALIDATION_STRING,
    mnemonic: undefined,
    appLockStatus: WALLET_STATUS.LOCKED,
}

export const ConfigSlice = createSlice({
    name: "Config",
    initialState,
    reducers: {
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
        setMnemonic: (state, action: PayloadAction<string | undefined>) => {
            state.mnemonic = action.payload
        },
        setAppLockStatus: (state, action: PayloadAction<WALLET_STATUS>) => {
            state.appLockStatus = action.payload
        },
    },
    extraReducers: builder => {
        builder.addCase(PURGE, () => initialState)
    },
})

export const {
    setUserSelectedSecurity,
    setLastSecurityLevel,
    setIsSecurityDowngrade,
    setIsResettingApp,
    setPinValidationString,
    setMnemonic,
    setAppLockStatus,
} = ConfigSlice.actions
