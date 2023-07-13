import { createSelector } from "@reduxjs/toolkit"
import { RootState } from "../Types"
import { SessionTypes } from "@walletconnect/types"

const selectSessionsState = (state: RootState) => state

export const selectSessions = createSelector(selectSessionsState, state => {
    return state.sessions
})

export const selectSessionsFlat = createSelector(selectSessions, sessions => {
    const flatSessions: Array<SessionTypes.Struct> = []

    for (const address in sessions) {
        flatSessions.push(...sessions[address])
    }

    return flatSessions
})
