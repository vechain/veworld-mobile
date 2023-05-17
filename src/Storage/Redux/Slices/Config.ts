import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { SecurityLevelType } from "~Model"
import { SettingsConstants } from "~Common/Constant"

export interface ConfigState {
    userSelectedSecurity: SecurityLevelType
    lastSecurityLevel: SecurityLevelType
    isSecurityDowngrade: boolean
    isResettingApp: boolean
    pinValidationString: string
}

const initialState: ConfigState = {
    userSelectedSecurity: SecurityLevelType.NONE,
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
            action: PayloadAction<SecurityLevelType>,
        ) => {
            state.userSelectedSecurity = action.payload
        },

        setLastSecurityLevel: (
            state,
            action: PayloadAction<SecurityLevelType>,
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
