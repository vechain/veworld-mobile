import { createSelector } from "@reduxjs/toolkit"
import { RootState } from "../Types"
import { ISession } from "@walletconnect/types"

const selectSessionsState = (state: RootState) => state.sessions

export const selectSessions = createSelector(selectSessionsState, state => {
    return state.sessions
})

export const selectSessionByTopic = (topic: string) =>
    createSelector(selectSessionsState, state => {
        return state.sessions.filter(
            (session: ISession) => session.topic === topic,
        )
    })
