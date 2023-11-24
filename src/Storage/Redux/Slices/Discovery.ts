import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { DAppConfig, DiscoveryDApp } from "~Constants"
import { URIUtils } from "~Utils"

export type DiscoveryState = {
    featured: DiscoveryDApp[]
    favorites: DiscoveryDApp[]
    custom: DiscoveryDApp[]
}

export const initialDiscoverState: DiscoveryState = {
    featured: DAppConfig,
    favorites: [],
    custom: [],
}
export const DiscoverySlice = createSlice({
    name: "discovery",
    initialState: initialDiscoverState,
    reducers: {
        addBookmark: (state, action: PayloadAction<DiscoveryDApp>) => {
            const { payload } = action
            if (payload.isCustom) {
                state.custom.push(payload)
            } else {
                state.favorites.push(payload)
            }
        },
        removeBookmark: (state, action: PayloadAction<DiscoveryDApp>) => {
            const { isCustom, href } = action.payload
            if (isCustom) {
                state.custom = state.custom.filter(dapp => !URIUtils.compareURLs(dapp.href, href))
            } else {
                state.favorites = state.favorites.filter(dapp => !URIUtils.compareURLs(dapp.href, href))
            }
        },
        resetDiscoveryState: () => initialDiscoverState,
    },
})

export const { addBookmark, removeBookmark, resetDiscoveryState } = DiscoverySlice.actions
