import { createSlice, Draft, PayloadAction } from "@reduxjs/toolkit"
import { Verify } from "@walletconnect/types/dist/types/core/verify"

/**
 * One account can have multiple sessions.
 *
 * Mapping account topic => verify context
 */

export type WalletConnectState = Record<string, Verify.Context["verified"]>

export const initialSessionsState: WalletConnectState = {}

export const WalletConnectSessionsSlice = createSlice({
    name: "sessions",
    initialState: initialSessionsState,
    reducers: {
        insertContext: (
            state: Draft<WalletConnectState>,
            action: PayloadAction<{
                topic: string
                verifyContext: Verify.Context["verified"]
            }>,
        ) => {
            const { topic, verifyContext } = action.payload

            state[topic] = verifyContext
        },
        deleteContext: (
            state: Draft<WalletConnectState>,
            action: PayloadAction<{
                topic: string
            }>,
        ) => {
            const { topic } = action.payload

            delete state[topic]
        },
        resetWalletConnectState: () => initialSessionsState,
    },
})

export const { insertContext, deleteContext, resetWalletConnectState } =
    WalletConnectSessionsSlice.actions
