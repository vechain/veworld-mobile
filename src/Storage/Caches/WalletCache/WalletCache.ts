import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { WalletState } from "~Model"

export const initialWalletState: WalletState = {
    mnemonic: "",
}

export const walletStateSlice = createSlice({
    name: "walletState",
    initialState: initialWalletState,
    reducers: {
        setMnemonic: (state, action: PayloadAction<string>) => {
            state.mnemonic = action.payload
        },
        purgeWalletState: () => {
            return initialWalletState
        },
    },
})

export const { setMnemonic, purgeWalletState } = walletStateSlice.actions
