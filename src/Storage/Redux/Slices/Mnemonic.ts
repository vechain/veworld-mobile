import { createSlice, PayloadAction } from "@reduxjs/toolkit"

type InitialMnemonicState = { value?: string }
export const initialMnemonicState: InitialMnemonicState = { value: undefined }

export const MnemonicSlice = createSlice({
    name: "mnemonic",
    initialState: initialMnemonicState as InitialMnemonicState,
    reducers: {
        setMnemonic: (state, action: PayloadAction<string | undefined>) => {
            state.value = action.payload
        },
    },
})

export const { setMnemonic } = MnemonicSlice.actions
