import { createSlice, PayloadAction } from "@reduxjs/toolkit"

export type DiscoveryState = {
    bookmarks: string[]
}

export const initialDiscoverState: DiscoveryState = {
    bookmarks: [],
}
export const DiscoverySlice = createSlice({
    name: "discovery",
    initialState: initialDiscoverState,
    reducers: {
        addBookmark: (state, action: PayloadAction<string>) => {
            if (state.bookmarks.includes(action.payload)) return

            state.bookmarks.push(action.payload)
        },
        removeBookmark: (state, action: PayloadAction<string>) => {
            const index = state.bookmarks.indexOf(action.payload)
            if (index === -1) return

            state.bookmarks.splice(index, 1)
        },
        resetDiscoveryState: () => initialDiscoverState,
    },
})

export const { addBookmark, removeBookmark, resetDiscoveryState } =
    DiscoverySlice.actions
