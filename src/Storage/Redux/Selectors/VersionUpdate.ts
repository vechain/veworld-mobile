import { createSelector } from "@reduxjs/toolkit"
import { RootState } from "../Types"

const selectVersionUpdateState = (state: RootState) => state.versionUpdate

export const selectUpdateDismissCount = createSelector(selectVersionUpdateState, state => {
    return state.updateRequest.dismissCount
})

export const selectLastUpdateDismissTime = createSelector(selectVersionUpdateState, state => {
    return state.updateRequest.lastDismissedDate
})

export const selectAdvisedAppVersion = createSelector(selectVersionUpdateState, state => {
    return state.advisedVersion
})

export const selectInstalledAppVersion = createSelector(selectVersionUpdateState, state => {
    return state.installedVersion
})

export const selectUpdatePromptStatus = createSelector(selectVersionUpdateState, state => {
    return state
})
