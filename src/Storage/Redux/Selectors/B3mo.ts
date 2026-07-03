import { createSelector } from "@reduxjs/toolkit"
import { RootState } from "../Types"

export const selectB3moState = (state: RootState) => state.b3mo
export const selectB3moSessionState = (state: RootState) => state.b3moSession

export const selectB3moLinkedAddress = createSelector(selectB3moState, s => s.linkedAddress)

export const selectIsB3moOnboarded = createSelector(selectB3moState, s =>
    Boolean(s.linkedAddress && s.onboardingAcceptedAt),
)

export const selectB3moOnboardingAcceptedAt = createSelector(selectB3moState, s => s.onboardingAcceptedAt)

export const selectB3moExecutionMode = createSelector(selectB3moState, s => s.executionMode)

export const selectB3moSessionPassword = createSelector(selectB3moSessionState, s => s.password)

export const selectB3moJwt = createSelector(selectB3moSessionState, s => s.jwt)

export const selectB3moJwtExpiresAt = createSelector(selectB3moSessionState, s => s.jwtExpiresAt)

export const selectB3moCurrentSessionId = createSelector(selectB3moSessionState, s => s.currentSessionId)

export const selectIsB3moSessionUnlocked = createSelector(selectB3moSessionState, selectB3moState, (session, b3mo) =>
    Boolean(session.password && session.jwt && b3mo.linkedAddress),
)
