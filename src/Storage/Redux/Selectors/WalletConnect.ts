import { RootState } from "~Storage/Redux/Types"
import { createSelector } from "@reduxjs/toolkit"

const selectWcState = (state: RootState) => state.walletConnect

export const selectSessions = createSelector(
    selectWcState,
    state => state.sessions,
)

export const selectSessionByTopic = createSelector(
    selectSessions,
    (_: RootState, topic: string) => topic,
    (sessions, topic) => sessions[topic],
)

export const selectPendingRequests = createSelector(
    selectWcState,
    state => state.pendingRequests,
)

export const selectPendingSession = createSelector(
    selectWcState,
    state => state.pendingSession,
)

export const selectWalletConnectDeepLinks = createSelector(
    selectWcState,
    state => state.deepLinks,
)
