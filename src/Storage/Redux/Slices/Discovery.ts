import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { DiscoveryDApp } from "~Constants"
import { URIUtils } from "~Utils"

export type ConnectedDiscoveryApp = {
    name: string
    href: string
    connectedTime: number
}

export type LoginSession =
    | { kind: "external"; address: string }
    | { kind: "temporary"; address: string }
    | { kind: "permanent" }

export type Tab = {
    id: string
    href: string
    preview?: string
    title: string
}

export type BannerInteractionDetails = {
    amountOfInteractions: number
}

export type DiscoveryState = {
    featured: DiscoveryDApp[]
    favorites: DiscoveryDApp[]
    custom: DiscoveryDApp[]
    hasOpenedDiscovery: boolean
    connectedApps: ConnectedDiscoveryApp[]
    tabsManager: {
        currentTabId: string | null
        tabs: Tab[]
    }
    bannerInteractions: {
        [bannerName: string]: BannerInteractionDetails
    }
    sessions?: {
        [appOrigin: string]: LoginSession
    }
}

export const initialDiscoverState: DiscoveryState = {
    featured: [],
    favorites: [],
    custom: [],
    hasOpenedDiscovery: false,
    connectedApps: [],
    tabsManager: {
        currentTabId: null,
        tabs: [],
    },
    bannerInteractions: {},
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
        reorderBookmarks: (state, action: PayloadAction<DiscoveryDApp[]>) => {
            state.favorites = action.payload
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
            } else {
                const favourite = findByHref(state.favorites, payload.href)

                if (favourite) {
                    favourite.amountOfNavigations += 1
                }

                const featured = findByHref(state.featured, payload.href)

                if (featured) {
                    featured.amountOfNavigations += 1
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
        openTab: (state, action: PayloadAction<Tab>) => {
            state.tabsManager.tabs.push(action.payload)
            state.tabsManager.currentTabId = action.payload.id
        },
        updateTab: (state, action: PayloadAction<Pick<Tab, "id"> & Partial<Omit<Tab, "id">>>) => {
            const { id, ...otherProps } = action.payload
            const tabIndex = state.tabsManager.tabs.findIndex(tab => tab.id === id)
            if (tabIndex !== -1) {
                Object.entries(otherProps)
                    .filter(([_, value]) => typeof value !== "undefined")
                    .forEach(
                        ([key, value]) => (state.tabsManager.tabs[tabIndex][key as keyof typeof otherProps] = value),
                    )
            }
        },
        setCurrentTab: (state, action: PayloadAction<string>) => {
            state.tabsManager.currentTabId = action.payload
        },
        closeTab: (state, action: PayloadAction<string>) => {
            state.tabsManager.tabs = state.tabsManager.tabs.filter(tab => tab.id !== action.payload)
            state.tabsManager.currentTabId = state.tabsManager.tabs[state.tabsManager.tabs.length - 1]?.id ?? null
        },
        closeAllTabs: state => {
            state.tabsManager.tabs = []
            state.tabsManager.currentTabId = null
        },
        resetDiscoveryState: () => initialDiscoverState,
        incrementBannerInteractions: (state, action: PayloadAction<string>) => {
            state.bannerInteractions[action.payload] = {
                amountOfInteractions: (state.bannerInteractions[action.payload]?.amountOfInteractions ?? 0) + 1,
            }
        },
        clearTemporarySessions: state => {
            state.sessions = Object.fromEntries(
                Object.entries(state.sessions ?? {}).filter(([_, session]) => {
                    if (session.kind === "temporary") return false
                    return true
                }),
            )
        },
        deleteSession(state, action: PayloadAction<string>) {
            delete state.sessions?.[action.payload]
            const parsedUrl = new URL(action.payload)
            this.removeConnectedDiscoveryApp(state, {
                type: "discovery/addConnectedDiscoveryApp",
                payload: { connectedTime: Date.now(), href: parsedUrl.hostname, name: parsedUrl.hostname },
            })
        },
        addSession(state, action: PayloadAction<{ url: string } & LoginSession>) {
            const { url, ...rest } = action.payload
            const parsedUrl = new URL(url)
            if (!state.sessions) state.sessions = {}
            state.sessions[parsedUrl.origin] = rest

            //Keep backwards compatibility
            this.addConnectedDiscoveryApp(state, {
                type: "discovery/addConnectedDiscoveryApp",
                payload: { connectedTime: Date.now(), href: parsedUrl.hostname, name: parsedUrl.hostname },
            })
        },
    },
})

export const {
    addBookmark,
    removeBookmark,
    reorderBookmarks,
    resetDiscoveryState,
    addNavigationToDApp,
    setDiscoverySectionOpened,
    addConnectedDiscoveryApp,
    removeConnectedDiscoveryApp,
    setFeaturedDApps,
    openTab,
    updateTab,
    setCurrentTab,
    closeTab,
    closeAllTabs,
    incrementBannerInteractions,
    clearTemporarySessions,
    deleteSession,
    addSession,
} = DiscoverySlice.actions
