import { createSelector } from "@reduxjs/toolkit"
import { RootState } from "../Types"

export const selectAnalyticsState = (state: RootState) => state.analytics

export const selectCurrentScreen = createSelector(selectAnalyticsState, state => {
    return state.currentScreen
})
