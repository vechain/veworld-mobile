import { createSelector } from "@reduxjs/toolkit"
import { RootState } from "../Types"
import type { WalletConnectState } from "../Slices/WalletConnect"

export const selectWcState = (state: RootState) => state.sessions

export const selectVerifyContext = createSelector(
    [selectWcState, (_: RootState, topic?: string) => topic],
    (sessions: WalletConnectState, topic) => {
        if (!topic) return

        return sessions[topic]
    },
)
