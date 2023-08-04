import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { MetadataCacheEntry, MetadataCacheState } from "../Types"
import { createKey } from "~Utils/CacheKeyUtils/CacheKeyUtils"

export const initialMetadataCacheState: MetadataCacheState = {
    cache: {},
}

export const MetadataCacheSlice = createSlice({
    name: "metadataCache",
    initialState: initialMetadataCacheState,
    reducers: {
        addMetadataEntry: (
            state,
            action: PayloadAction<MetadataCacheEntry>,
        ) => {
            state.cache[createKey(action.payload.seed)] = action.payload.value
        },
        removeMetadataEntry: (state, action: PayloadAction<string>) => {
            delete state.cache[action.payload]
        },
        resetMetadataCacheState: () => initialMetadataCacheState,
    },
})

export const {
    addMetadataEntry,
    removeMetadataEntry,
    resetMetadataCacheState,
} = MetadataCacheSlice.actions
