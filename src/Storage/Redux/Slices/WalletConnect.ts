import { createSlice, Draft, PayloadAction } from "@reduxjs/toolkit"
import { Verify } from "@walletconnect/types/dist/types/core/verify"

/**
 * One account can have multiple sessions.
 *
 * Mapping account topic => verify context
 */
type SessionState = {
    verifyContext: Verify.Context["verified"]
    isDeepLink: boolean
}

export type WalletConnectState = Record<string, SessionState>

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
                isDeepLink: boolean
            }>,
        ) => {
            const { topic, verifyContext, isDeepLink } = action.payload

            state[topic] = { verifyContext, isDeepLink }
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

        cleanContexts: (
            state: Draft<WalletConnectState>,
            action: PayloadAction<{
                activeTopics: string[]
            }>,
        ) => {
            const { activeTopics } = action.payload

            Object.keys(state).forEach(topic => {
                if (!activeTopics.includes(topic)) {
                    delete state[topic]
                }
            })
        },
        resetWalletConnectState: () => initialSessionsState,
    },
})

export const {
    insertContext,
    deleteContext,
    resetWalletConnectState,
    cleanContexts,
} = WalletConnectSessionsSlice.actions
