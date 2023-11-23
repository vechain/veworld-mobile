import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { CompatibleDApp, CompatibleDApps } from "~Constants"

export type DiscoveryState = {
    featured: CompatibleDApp[]
    favorites: CompatibleDApp[]
    custom: CompatibleDApp[]
}

export const initialDiscoverState: DiscoveryState = {
    featured: CompatibleDApps,
    favorites: [],
    custom: [],
}
export const DiscoverySlice = createSlice({
    name: "discovery",
    initialState: initialDiscoverState,
    reducers: {
        addBookmark: (state, action: PayloadAction<CompatibleDApp>) => {
            const { payload } = action
            if (payload.isCustom) {
                state.custom.push(payload)
            } else {
                state.favorites.push(payload)
                state.featured = state.featured.filter(dapp => dapp.id !== payload.id)
            }
        },
        removeBookmark: (state, action: PayloadAction<CompatibleDApp>) => {
            const { isCustom, id } = action.payload
            if (isCustom) {
                state.custom = state.custom.filter(dapp => dapp.id !== id)
            } else {
                state.favorites = state.favorites.filter(dapp => dapp.id !== id)
                state.featured.unshift(action.payload)
            }
        },
        resetDiscoveryState: () => initialDiscoverState,
    },
})

export const { addBookmark, removeBookmark, resetDiscoveryState } = DiscoverySlice.actions
