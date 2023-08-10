import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { WALLET_STATUS, NewLedgerDevice } from "~Model"

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
    appLockStatus: WALLET_STATUS
    isAppLoading: boolean
    isTokensOwnedLoading: boolean
}

const initialState: CacheState = {
    mnemonic: undefined,
    newLedgerDevice: undefined,
    appLockStatus: WALLET_STATUS.LOCKED,
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
        setAppLockStatus: (state, action: PayloadAction<WALLET_STATUS>) => {
            state.appLockStatus = action.payload
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
    setAppLockStatus,
    setIsAppLoading,
    setIsTokensOwnedLoading,
    resetCacheState,
} = CacheSlice.actions
