import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import moment from "moment"
import { AppVersion } from "~Model/AppVersion"

const initialVersionUpdateState: AppVersion = {
    installedVersion: "",
    advisedVersion: "",
    isUpToDate: null,
    updateRequest: {
        dismissCount: 0,
        lastDismissedDate: "",
    },
}

export const VersionUpdateSlice = createSlice({
    name: "versionUpdate",
    initialState: initialVersionUpdateState,
    reducers: {
        incrementDismissCount: state => {
            state.updateRequest.dismissCount += 1
            state.updateRequest.lastDismissedDate = moment().toISOString()
        },

        resetDismissCount: state => {
            state.updateRequest.dismissCount = 0
            state.updateRequest.lastDismissedDate = ""
        },

        setAdvisedVersion: (state, action: PayloadAction<string>) => {
            if (state.advisedVersion !== action.payload) {
                state.advisedVersion = action.payload
                state.updateRequest.dismissCount = 0
                state.updateRequest.lastDismissedDate = ""
            }
        },

        setInstalledVersion: (state, action: PayloadAction<string>) => {
            state.installedVersion = action.payload
        },

        setIsUpToDate: (state, action: PayloadAction<boolean>) => {
            state.isUpToDate = action.payload
        },

        resetVersionUpdateState: () => initialVersionUpdateState,
    },
})

export const {
    incrementDismissCount,
    resetDismissCount,
    setAdvisedVersion,
    setInstalledVersion,
    setIsUpToDate,
    resetVersionUpdateState,
} = VersionUpdateSlice.actions
