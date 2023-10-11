import { createSelector } from "@reduxjs/toolkit"
import { RootState } from "../Types"
import { WalletConnectState } from "~Storage/Redux"

const selectWcState = (state: RootState) => state.sessions

export const selectVerifyContext = createSelector(
    [selectWcState, (_: RootState, topic: string) => topic],
    (sessions: WalletConnectState, topic) => {
        return sessions[topic]
    },
)
