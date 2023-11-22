import { RootState } from "../Types"
import { createSelector } from "@reduxjs/toolkit"

const getDiscoveryState = (state: RootState) => state.discovery

export const selectBookmarks = createSelector(
    getDiscoveryState,
    state => state.bookmarks,
)
