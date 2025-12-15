import { defaultMainNetwork, defaultTestNetwork } from "~Constants/Constants"
import { WalletPreferencesState } from "../Types"
import { createSlice, PayloadAction } from "@reduxjs/toolkit"

export const initialWalletPreferencesState: WalletPreferencesState = {
    [defaultMainNetwork.genesis.id]: {},
    [defaultTestNetwork.genesis.id]: {},
}

export const WalletPreferencesSlice = createSlice({
    name: "walletPreferences",
    initialState: initialWalletPreferencesState,
    reducers: {
        setLastValidatorExited: (
            state,
            action: PayloadAction<{ genesisId: string; address: string; timestamp: number }>,
        ) => {
            const { genesisId, address, timestamp } = action.payload

            if (!state[genesisId]) {
                state[genesisId] = {}
            }

            if (!state[genesisId][address]) {
                state[genesisId][address] = {
                    lastValidatorExitedAt: timestamp,
                }
            } else {
                state[genesisId][address].lastValidatorExitedAt = timestamp
            }
        },
        resetWalletPreferencesState: () => initialWalletPreferencesState,
    },
})

export const { setLastValidatorExited, resetWalletPreferencesState } = WalletPreferencesSlice.actions
