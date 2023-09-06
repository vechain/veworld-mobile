import { createSelector } from "@reduxjs/toolkit"
import { RootState } from "../Types"
import { SessionTypes } from "@walletconnect/types"
import { ConnectedApp } from "~Storage/Redux"

const selectSessionsState = (state: RootState) => state

export const selectSessions = createSelector(selectSessionsState, state => {
    return state.sessions
})

export const selectConnectAppsFlat = createSelector(
    selectSessions,
    connectedApps => {
        const flatApps: Array<ConnectedApp> = []

        for (const address in connectedApps) {
            flatApps.push(...connectedApps[address])
        }

        return flatApps
    },
)

export const selectSessionsFlat = createSelector(
    selectSessions,
    connectedApps => {
        const flatSessions: Array<SessionTypes.Struct> = []

        for (const address in connectedApps) {
            flatSessions.push(...connectedApps[address].map(app => app.session))
        }

        return flatSessions
    },
)

//Takes session topic as parameter and returns the connected app if it exists
export const selectedConnectedApp = createSelector(
    selectConnectAppsFlat,
    (state: RootState, topic: string) => topic,
    (connectedApps, topic) => {
        return connectedApps.find(app => app.session.topic === topic)
    },
)
