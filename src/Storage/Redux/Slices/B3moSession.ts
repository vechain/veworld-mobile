import { createSlice, PayloadAction } from "@reduxjs/toolkit"

export interface B3moSessionState {
    password?: string
    jwt?: string
    jwtExpiresAt?: number
    currentSessionId?: string
}

const initialState: B3moSessionState = {}

export const B3moSessionSlice = createSlice({
    name: "b3moSession",
    initialState,
    reducers: {
        setB3moSessionPassword: (state, action: PayloadAction<{ password: string }>) => {
            state.password = action.payload.password
        },
        setB3moJwt: (state, action: PayloadAction<{ jwt: string; expiresAt?: number }>) => {
            state.jwt = action.payload.jwt
            state.jwtExpiresAt = action.payload.expiresAt
        },
        setB3moCurrentSession: (state, action: PayloadAction<{ sessionId: string | undefined }>) => {
            state.currentSessionId = action.payload.sessionId
        },
        resetB3moSessionState: () => initialState,
    },
})

export const { setB3moSessionPassword, setB3moJwt, setB3moCurrentSession, resetB3moSessionState } =
    B3moSessionSlice.actions
