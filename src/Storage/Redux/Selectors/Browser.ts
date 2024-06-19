import { createSelector } from "@reduxjs/toolkit"
import { RootState } from "../Types"

export const selectBrowserState = (state: RootState) => state.browser

export const selectVisitedUrls = createSelector(selectBrowserState, state => state.visitedUrls)
