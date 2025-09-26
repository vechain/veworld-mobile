import { createSelector } from "@reduxjs/toolkit"
import { RootState } from "../Types"
import { selectSelectedAccount } from "./Account"
import { AddressUtils } from "~Utils"
import { SessionState } from "../Slices"

export const selectExternalDappsState = (state: RootState) => state.externalDapps

export const selectExternalDappSessions = createSelector(
    [selectExternalDappsState, (_: RootState, genesisId: string) => genesisId],
    (externalDapps, genesisId) => externalDapps.sessions[genesisId],
)

export const selectExternalDappSession = createSelector(
    [selectExternalDappSessions, (_: RootState, appPublicKey: string) => appPublicKey],
    (sessions, appPublicKey) => sessions[appPublicKey],
)

export const selectExternalDappSessionsForAccount = createSelector(
    [selectExternalDappSessions, selectSelectedAccount],
    (sessions, account) =>
        Object.entries(sessions).reduce((acc, [appPublicKey, session]) => {
            if (AddressUtils.compareAddresses(session.address, account.address)) {
                acc[appPublicKey] = session
            }
            return acc
        }, {} as Record<string, SessionState>),
)
