import { createSlice, PayloadAction } from "@reduxjs/toolkit"

type InitialMnemonicState = string | undefined
export const initialMnemonicState: InitialMnemonicState = undefined

export const MnemonicSlice = createSlice({
    name: "mnemonic",
    initialState: initialMnemonicState as InitialMnemonicState,
    reducers: {
        setMnemonic: (state, action: PayloadAction<string | undefined>) => {
            state = action.payload
        },
    },
})

export const { setMnemonic } = MnemonicSlice.actions
