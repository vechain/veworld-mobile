import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import moment from "moment"
import { AppVersion } from "~Model/AppVersion"

const initialVersionUpdateState: AppVersion = {
    installedVersion: "",
    breakingVersion: "",
    isUpToDate: null,
    lastManifestCheck: null,
    updateRequest: {
        dismissCount: 0,
        lastDismissedDate: null,
    },
}

export const VersionUpdateSlice = createSlice({
    name: "versionUpdate",
    initialState: initialVersionUpdateState,
    reducers: {
        incrementDismissCount: state => {
            state.updateRequest.dismissCount += 1
            state.updateRequest.lastDismissedDate = moment().unix()
        },

        resetDismissCount: state => {
            state.updateRequest.dismissCount = 0
            state.updateRequest.lastDismissedDate = null
        },

        setBreakingVersion: (state, action: PayloadAction<string>) => {
            if (state.breakingVersion !== action.payload) {
                state.breakingVersion = action.payload
                state.updateRequest.dismissCount = 0
                state.updateRequest.lastDismissedDate = null
            }
        },

        setInstalledVersion: (state, action: PayloadAction<string>) => {
            state.installedVersion = action.payload
        },

        setIsUpToDate: (state, action: PayloadAction<boolean>) => {
            state.isUpToDate = action.payload
        },

        setLastManifestCheck: (state, action: PayloadAction<number>) => {
            state.lastManifestCheck = action.payload
        },

        resetVersionUpdateState: () => initialVersionUpdateState,
    },
})

export const {
    incrementDismissCount,
    resetDismissCount,
    setBreakingVersion,
    setInstalledVersion,
    setIsUpToDate,
    setLastManifestCheck,
    resetVersionUpdateState,
} = VersionUpdateSlice.actions
