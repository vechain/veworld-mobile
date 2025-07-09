import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { AppVersion } from "~Model/AppVersion"

const initialVersionUpdateState: AppVersion = {
    installedVersion: "",
    majorVersion: "",
    latestVersion: "",
    isUpToDate: null,
    lastManifestCheck: null,
    shouldShowChangelog: false,
    changelogKey: null,
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
            state.updateRequest.lastDismissedDate = Date.now()
        },

        resetDismissCount: state => {
            state.updateRequest.dismissCount = 0
            state.updateRequest.lastDismissedDate = null
        },

        setMajorVersion: (state, action: PayloadAction<string>) => {
            if (state.majorVersion !== action.payload) {
                state.majorVersion = action.payload
                state.updateRequest.dismissCount = 0
                state.updateRequest.lastDismissedDate = null
            }
        },

        setInstalledVersion: (state, action: PayloadAction<string>) => {
            state.installedVersion = action.payload
        },

        setLatestVersion: (state, action: PayloadAction<string>) => {
            state.latestVersion = action.payload
        },

        setIsUpToDate: (state, action: PayloadAction<boolean>) => {
            state.isUpToDate = action.payload
        },

        setLastManifestCheck: (state, action: PayloadAction<number>) => {
            state.lastManifestCheck = action.payload
        },

        setChangelogToShow: (state, action: PayloadAction<{ shouldShow: boolean; changelogKey: string | null }>) => {
            state.shouldShowChangelog = action.payload.shouldShow
            state.changelogKey = action.payload.changelogKey
        },

        resetVersionUpdateState: () => initialVersionUpdateState,
    },
})

export const {
    incrementDismissCount,
    resetDismissCount,
    setMajorVersion,
    setInstalledVersion,
    setLatestVersion,
    setIsUpToDate,
    setLastManifestCheck,
    setChangelogToShow,
    resetVersionUpdateState,
} = VersionUpdateSlice.actions
