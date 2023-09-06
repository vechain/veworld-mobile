import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { ImageCacheEntry, ImageCacheState } from "../Types"
import { createKey } from "~Utils/CacheKeyUtils/CacheKeyUtils"

export const initialImageCacheState: ImageCacheState = {
    cache: {},
}

export const ImageCacheSlice = createSlice({
    name: "imageCache",
    initialState: initialImageCacheState,
    reducers: {
        addImageEntry: (state, action: PayloadAction<ImageCacheEntry>) => {
            state.cache[createKey(action.payload.seed)] = action.payload.value
        },
        removeImageEntry: (state, action: PayloadAction<string>) => {
            delete state.cache[action.payload]
        },
        resetImageCacheState: () => initialImageCacheState,
    },
})

export const { addImageEntry, removeImageEntry, resetImageCacheState } =
    ImageCacheSlice.actions
