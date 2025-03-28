import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { DerivationPath } from "~Constants/Constants/derivationPaths"
import { NewLedgerDevice } from "~Model"

/**
 * A state which is not persisted to storage usually used to share data between screens
 * @field `mnemonic` - the mnemonic just imported/generated
 * @field `newLedgerDevice` - the ledger device just imported
 * @field `appLockStatus` - the status of the app lock
 *
 */
export interface CacheState {
    mnemonic?: string[]
    privateKey?: string
    newLedgerDevice?: NewLedgerDevice
    isAppLoading: boolean
    isTokensOwnedLoading: boolean
    derivedPath: DerivationPath
    userHasBeenAskedForBuckup?: boolean
    googleDriveBackupEnabled?: boolean
}

const initialState: CacheState = {
    mnemonic: undefined,
    privateKey: undefined,
    newLedgerDevice: undefined,
    isAppLoading: false,
    isTokensOwnedLoading: false,
    derivedPath: DerivationPath.VET,
    userHasBeenAskedForBuckup: false,
    googleDriveBackupEnabled: false,
}

export const CacheSlice = createSlice({
    name: "cache",
    initialState,
    reducers: {
        setPrivateKey: (state, action: PayloadAction<string | undefined>) => {
            state.privateKey = action.payload
        },
        setMnemonic: (state, action: PayloadAction<string[] | undefined>) => {
            state.mnemonic = action.payload
        },
        setNewLedgerDevice: (state, action: PayloadAction<NewLedgerDevice | undefined>) => {
            state.newLedgerDevice = action.payload
        },
        setIsAppLoading: (state, action: PayloadAction<boolean>) => {
            state.isAppLoading = action.payload
        },
        setIsTokensOwnedLoading: (state, action: PayloadAction<boolean>) => {
            state.isTokensOwnedLoading = action.payload
        },
        setDerivedPath: (state, action: PayloadAction<DerivationPath>) => {
            state.derivedPath = action.payload
        },
        resetCacheState: () => initialState,
    },
})

export const {
    setMnemonic,
    setPrivateKey,
    setNewLedgerDevice,
    setIsAppLoading,
    setIsTokensOwnedLoading,
    resetCacheState,
    setDerivedPath,
} = CacheSlice.actions
