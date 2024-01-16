import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { BeatState } from "../Types/Beat"
import { Beat } from "~Model"
import { genesisesId } from "~Constants"

export const initialBeatState: BeatState = {
    latestBeat: {
        number: 0,
        id: genesisesId.main,
        parentID: genesisesId.main,
        timestamp: 0,
        gasLimit: 0,
        bloom: "",
        k: 0,
        obsolete: false,
    },
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
