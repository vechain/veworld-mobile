import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { WALLET_STATUS } from "~Model"

export interface CacheState {
    mnemonic?: string
    appLockStatus: WALLET_STATUS
}

const initialState: CacheState = {
    mnemonic: undefined,
    appLockStatus: WALLET_STATUS.LOCKED,
}

export const CacheSlice = createSlice({
    name: "Cache",
    initialState,
    reducers: {
        setMnemonic: (state, action: PayloadAction<string | undefined>) => {
            state.mnemonic = action.payload
        },
        setAppLockStatus: (state, action: PayloadAction<WALLET_STATUS>) => {
            state.appLockStatus = action.payload
        },
    },
})

export const { setMnemonic, setAppLockStatus } = CacheSlice.actions
