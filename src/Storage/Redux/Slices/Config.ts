import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { SecurityLevelType } from "~Model"
import { SettingsConstants } from "~Common/Constant"

export interface ConfigState {
    userSelectedSecurity: SecurityLevelType
    lastSecurityLevel: SecurityLevelType
    isSecurityDowngrade: boolean
    pinValidationString: string
}

const initialState: ConfigState = {
    userSelectedSecurity: SecurityLevelType.NONE,
    lastSecurityLevel: SecurityLevelType.NONE,
    isSecurityDowngrade: false,
    pinValidationString: SettingsConstants.VALIDATION_STRING,
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
    },
})

export const {
    setUserSelectedSecurity,
    setLastSecurityLevel,
    setIsSecurityDowngrade,
    setPinValidationString,
} = ConfigSlice.actions
