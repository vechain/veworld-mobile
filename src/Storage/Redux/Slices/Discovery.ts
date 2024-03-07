import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { DiscoveryDApp } from "~Constants"
import { URIUtils } from "~Utils"

export type ConnectedDiscoveryApp = {
    name: string
    href: string
    connectedTime: number
}

export type DiscoveryState = {
    featured: DiscoveryDApp[]
    favorites: DiscoveryDApp[]
    custom: DiscoveryDApp[]
    hasOpenedDiscovery: boolean
    connectedApps: ConnectedDiscoveryApp[]
}

export const initialDiscoverState: DiscoveryState = {
    featured: [],
    favorites: [],
    custom: [],
    hasOpenedDiscovery: false,
    connectedApps: [],
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
        setFeaturedDApps: (state, action: PayloadAction<DiscoveryDApp[]>) => {
            state.featured = action.payload
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
        addConnectedDiscoveryApp: (state, action: PayloadAction<ConnectedDiscoveryApp>) => {
            if (!state.connectedApps) state.connectedApps = [action.payload]
            else if (state.connectedApps.find(app => app.href === action.payload.href)) return
            else {
                state.connectedApps.push(action.payload)
            }
        },
        removeConnectedDiscoveryApp: (state, action: PayloadAction<ConnectedDiscoveryApp>) => {
            if (!state.connectedApps) return
            state.connectedApps = state.connectedApps.filter(app => app.href !== action.payload.href)
        },
        setDiscoverySectionOpened: state => {
            state.hasOpenedDiscovery = true
        },
        resetDiscoveryState: () => initialDiscoverState,
    },
})

export const {
    addBookmark,
    removeBookmark,
    resetDiscoveryState,
    addNavigationToDApp,
    setDiscoverySectionOpened,
    addConnectedDiscoveryApp,
    removeConnectedDiscoveryApp,
    setFeaturedDApps,
} = DiscoverySlice.actions
