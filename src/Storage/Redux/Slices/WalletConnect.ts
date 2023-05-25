import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { ISession } from "@walletconnect/types"

type WalletConnectSessionsSliceState = {
    sessions: ISession[]
}

export const initialSessionsState: WalletConnectSessionsSliceState = {
    sessions: [],
}

export const WalletConnectSessionsSlice = createSlice({
    name: "sessions",
    initialState: initialSessionsState,
    reducers: {
        insertSession: (state, action: PayloadAction<ISession>) => {
            const sessionExists = state.sessions.find(
                session => session.topic === action.payload.topic,
            )
            if (!sessionExists) {
                state.sessions.push(action.payload)
            }
        },
        deleteSession: (state, action: PayloadAction<{ topic: string }>) => {
            const sessionExistsIndex = state.sessions.findIndex(
                session => session.topic === action.payload.topic,
            )

            if (sessionExistsIndex !== -1) {
                state.sessions.splice(sessionExistsIndex, 1)
            }
        },
    },
})

export const { insertSession, deleteSession } =
    WalletConnectSessionsSlice.actions
