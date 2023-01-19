import { createSelector } from "@reduxjs/toolkit"
import { RootState } from "~Storage/Caches"

const appStateSlice = (state: RootState) => state.appState

export const selectCurrentAppState = createSelector(
    appStateSlice,
    state => state.currentState,
)

export const selectPreviousAppState = createSelector(
    appStateSlice,
    state => state.previousState,
)
