import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { SecurityLevelType } from "~Model"
import { SettingsConstants } from "~Constants"

export interface ConfigState {
    userSelectedSecurity: SecurityLevelType
    lastSecurityLevel: SecurityLevelType
    isSecurityDowngrade: boolean
    pinValidationString: string
    isAppBlocked: boolean
}

const initialState: ConfigState = {
    userSelectedSecurity: SecurityLevelType.NONE,
    lastSecurityLevel: SecurityLevelType.NONE,
    isSecurityDowngrade: false,
    pinValidationString: SettingsConstants.VALIDATION_STRING,
    isAppBlocked: false,
}

export const ConfigSlice = createSlice({
    name: "config",
    initialState,
    reducers: {
        /**
         * Set the user selected security level, also updating the last one
         * @param state
         * @param action
         */
        setUserSelectedSecurity: (
            state,
            action: PayloadAction<SecurityLevelType>,
        ) => {
            state.userSelectedSecurity = action.payload
            state.lastSecurityLevel = action.payload
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

        setPinValidationString: (state, action: PayloadAction<string>) => {
            state.pinValidationString = action.payload
        },
        setIsAppBlocked: (state, action: PayloadAction<boolean>) => {
            state.isAppBlocked = action.payload
        },
        resetConfigState: () => initialState,
    },
})

export const {
    setUserSelectedSecurity,
    setLastSecurityLevel,
    setIsSecurityDowngrade,
    setPinValidationString,
    setIsAppBlocked,
    resetConfigState,
} = ConfigSlice.actions
