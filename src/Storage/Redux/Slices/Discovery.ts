import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { DAppConfig, DiscoveryDApp } from "~Constants"
import { URIUtils } from "~Utils"

export type DiscoveryState = {
    featured: DiscoveryDApp[]
    favorites: DiscoveryDApp[]
    custom: DiscoveryDApp[]
}

export const initialDiscoverState: DiscoveryState = {
    featured: [...DAppConfig],
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
        addNavigationToDApp: (state, action: PayloadAction<{ href: string; isCustom: boolean }>) => {
            const { payload } = action

            if (payload.isCustom) {
                const existingDApp = state.custom.find(dapp => URIUtils.compareURLs(dapp.href, payload.href))

                if (existingDApp) {
                    existingDApp.amountOfNavigations += 1
                }

                //sort by amount of navigations
                state.custom = state.custom.sort((a, b) => b.amountOfNavigations - a.amountOfNavigations)
            } else {
                const favourite = state.favorites.find(dapp => URIUtils.compareURLs(dapp.href, payload.href))

                if (favourite) {
                    favourite.amountOfNavigations += 1
                    state.favorites = state.favorites.sort((a, b) => b.amountOfNavigations - a.amountOfNavigations)
                }

                const featured = state.featured.find(dapp => URIUtils.compareURLs(dapp.href, payload.href))

                if (featured) {
                    featured.amountOfNavigations += 1
                    state.featured = state.featured.sort((a, b) => b.amountOfNavigations - a.amountOfNavigations)
                }
            }
        },
        resetDiscoveryState: () => initialDiscoverState,
    },
})

export const { addBookmark, removeBookmark, resetDiscoveryState, addNavigationToDApp } = DiscoverySlice.actions
