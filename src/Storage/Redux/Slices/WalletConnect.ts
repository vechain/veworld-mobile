import { createSlice, Draft, PayloadAction } from "@reduxjs/toolkit"
import { SessionTypes } from "@walletconnect/types"
import { Verify } from "@walletconnect/types/dist/types/core/verify"

/**
 * One account can have multiple sessions.
 *
 * Mapping account address => Sessions
 */

export type ConnectedApp = {
    session: SessionTypes.Struct
    verifyContext: Verify.Context
}

type WalletConnectSessionsSliceState = Record<string, Array<ConnectedApp>>

export const initialSessionsState: WalletConnectSessionsSliceState = {}

export const WalletConnectSessionsSlice = createSlice({
    name: "sessions",
    initialState: initialSessionsState,
    reducers: {
        insertSession: (
            state: Draft<WalletConnectSessionsSliceState>,
            action: PayloadAction<{
                address: string
                connectedApp: ConnectedApp
            }>,
        ) => {
            const { address, connectedApp } = action.payload

            if (!state[address]) {
                state[address] = []
            }

            const sessionExists = state[address].find(
                app => connectedApp.session.topic === app.session.topic,
            )
            if (!sessionExists) {
                state[address].push(connectedApp)
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
                    app => app.session.topic === topic,
                )

                if (sessionExistsIndex !== -1) {
                    state[address].splice(sessionExistsIndex, 1)
                }
            }
        },
        resetWalletConnectState: () => initialSessionsState,
    },
})

export const { insertSession, deleteSession, resetWalletConnectState } =
    WalletConnectSessionsSlice.actions
