import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { NewLedgerDevice } from "~Model"

/**
 * A state which is not persisted to storage usually used to share data between screens
 * @field `mnemonic` - the mnemonic just imported/generated
 * @field `newLedgerDevice` - the ledger device just imported
 * @field `appLockStatus` - the status of the app lock
 *
 */
export interface CacheState {
    mnemonic?: string
    newLedgerDevice?: NewLedgerDevice
    isAppLoading: boolean
    isTokensOwnedLoading: boolean
}

const initialState: CacheState = {
    mnemonic: undefined,
    newLedgerDevice: undefined,
    isAppLoading: false,
    isTokensOwnedLoading: false,
}

export const CacheSlice = createSlice({
    name: "cache",
    initialState,
    reducers: {
        setMnemonic: (state, action: PayloadAction<string | undefined>) => {
            state.mnemonic = action.payload
        },
        setNewLedgerDevice: (
            state,
            action: PayloadAction<NewLedgerDevice | undefined>,
        ) => {
            state.newLedgerDevice = action.payload
        },
        setIsAppLoading: (state, action: PayloadAction<boolean>) => {
            state.isAppLoading = action.payload
        },
        setIsTokensOwnedLoading: (state, action: PayloadAction<boolean>) => {
            state.isTokensOwnedLoading = action.payload
        },
        resetCacheState: () => initialState,
    },
})

export const {
    setMnemonic,
    setNewLedgerDevice,
    setIsAppLoading,
    setIsTokensOwnedLoading,
    resetCacheState,
} = CacheSlice.actions
