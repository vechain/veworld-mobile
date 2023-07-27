import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { BeatState } from "../Types/Beat"
import { Beat } from "~Model"

export const initialBeatState: BeatState = {
    latestBeat: undefined,
}

export const BeatSlice = createSlice({
    name: "beat",
    initialState: initialBeatState,
    reducers: {
        updateBeat: (_, action: PayloadAction<Beat>) => {
            return { latestBeat: action.payload }
        },
        resetBeatState: () => initialBeatState,
    },
})

export const { updateBeat, resetBeatState } = BeatSlice.actions
