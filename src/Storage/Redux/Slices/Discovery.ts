import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { DAppConfig, DiscoveryDApp } from "~Constants"
import { URIUtils } from "~Utils"

export type DiscoveryState = {
    featured: DiscoveryDApp[]
    favorites: DiscoveryDApp[]
    custom: DiscoveryDApp[]
    hasOpenedDiscovery: boolean
}

export const initialDiscoverState: DiscoveryState = {
    featured: [...DAppConfig],
    favorites: [],
    custom: [],
    hasOpenedDiscovery: false,
}

const sortByAmountOfNavigations = (dapps: DiscoveryDApp[]) => {
    return dapps.sort((a, b) => b.amountOfNavigations - a.amountOfNavigations)
}

const findByHref = (dapps: DiscoveryDApp[], href: string) => {
    return dapps.find(dapp => URIUtils.compareURLs(dapp.href, href))
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
                const existingDApp = findByHref(state.custom, payload.href)

                if (existingDApp) {
                    existingDApp.amountOfNavigations += 1
                }

                //sort by amount of navigations
                state.custom = sortByAmountOfNavigations(state.custom)
            } else {
                const favourite = findByHref(state.favorites, payload.href)

                if (favourite) {
                    favourite.amountOfNavigations += 1
                    state.favorites = sortByAmountOfNavigations(state.favorites)
                }

                const featured = findByHref(state.featured, payload.href)

                if (featured) {
                    featured.amountOfNavigations += 1
                    state.featured = sortByAmountOfNavigations(state.featured)
                }
            }
        },
        setDiscoverySectionOpened: state => {
            state.hasOpenedDiscovery = true
        },
        resetDiscoveryState: () => initialDiscoverState,
    },
})

export const { addBookmark, removeBookmark, resetDiscoveryState, addNavigationToDApp, setDiscoverySectionOpened } =
    DiscoverySlice.actions
