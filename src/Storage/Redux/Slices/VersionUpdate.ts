import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import moment from "moment"
import { AppVersion } from "~Model/AppVersion"

const initialVersionUpdateState: AppVersion = {
    installedVersion: "",
    advisedVersion: "",
    isUpToDate: true,
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

        resetDismissHistory: state => {
            state.updateRequest.dismissCount = 0
            state.updateRequest.lastDismissedDate = ""
        },

        setAdvisedVersion: (state, action: PayloadAction<string>) => {
            const newVersion = action.payload
            state.advisedVersion = newVersion

            if (state.installedVersion && newVersion !== state.installedVersion) {
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

        resetVersionUpdate: () => initialVersionUpdateState,
    },
})

export const {
    incrementDismissCount,
    resetDismissHistory,
    setAdvisedVersion,
    setInstalledVersion,
    setIsUpToDate,
    resetVersionUpdate,
} = VersionUpdateSlice.actions
