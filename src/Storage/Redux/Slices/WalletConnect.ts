import { createSlice, Draft, PayloadAction } from "@reduxjs/toolkit"
import { SessionTypes } from "@walletconnect/types"

// type WalletConnectSessionsSliceState = {
//     sessions: SessionTypes.Struct[]
// }

/**
 * One account can have multiple sessions.
 *
 * Mapping account address => Sessions
 */
type WalletConnectSessionsSliceState = Record<string, SessionTypes.Struct[]>

export const initialSessionsState: WalletConnectSessionsSliceState = {}

export const WalletConnectSessionsSlice = createSlice({
    name: "sessions",
    initialState: initialSessionsState,
    reducers: {
        insertSession: (
            state: Draft<WalletConnectSessionsSliceState>,
            action: PayloadAction<{
                address: string
                session: SessionTypes.Struct
            }>,
        ) => {
            const { address, session } = action.payload

            if (!state[address]) {
                state[address] = []
            }

            const sessionExists = state[address].find(
                currentSession => currentSession.topic === session.topic,
            )
            if (!sessionExists) {
                state[address].push(session)
            }
        },
        deleteSession: (
            state,
            action: PayloadAction<{
                topic: string
            }>,
        ) => {
            const { topic } = action.payload

            for (const address in state) {
                const sessionExistsIndex = state[address].findIndex(
                    currentSession => currentSession.topic === topic,
                )

                if (sessionExistsIndex !== -1) {
                    state[address].splice(sessionExistsIndex, 1)
                }
            }
        },
    },
})

export const { insertSession, deleteSession } =
    WalletConnectSessionsSlice.actions
