import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import {
    SecurityLevelType,
    TSecurityLevel,
    UserSelectedSecurityLevel,
} from "~Model"
import { SettingsConstants } from "~Common/Constant"

export interface ConfigState {
    userSelectedSecurity: UserSelectedSecurityLevel
    lastSecurityLevel: TSecurityLevel
    isSecurityDowngrade: boolean
    isResettingApp: boolean
    pinValidationString: string
}

const initialState: ConfigState = {
    userSelectedSecurity: UserSelectedSecurityLevel.NONE,
    lastSecurityLevel: SecurityLevelType.NONE,
    isSecurityDowngrade: false,
    isResettingApp: false, // TODO - #316
    pinValidationString: SettingsConstants.VALIDATION_STRING,
}

export const ConfigSlice = createSlice({
    name: "config",
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
    },
})

export const {
    setUserSelectedSecurity,
    setLastSecurityLevel,
    setIsSecurityDowngrade,
    setIsResettingApp,
    setPinValidationString,
} = ConfigSlice.actions
