import { createSelector } from "@reduxjs/toolkit"
import { RootState } from "../Types"

const selectSessionsState = (state: RootState) => state

export const selectSessions = createSelector(selectSessionsState, state => {
    return state.sessions
})
