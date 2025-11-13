import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { DiscoveryDApp } from "~Constants"
import { VbdDApp } from "~Model"
import { DAppUtils, URIUtils } from "~Utils"

export type ConnectedDiscoveryApp = {
    name: string
    href: string
    connectedTime: number
}

export type LoginSession = {
    genesisId: string
    url: string
    name: string
    /**
     * If the login session is marked as `replaceable`, it means that it can be replaced by another session with the same parameters.
     * This is needed for backwards-compatibility with the old methods, which won't have a session
     */
    replaceable?: boolean
} & ({ kind: "external"; address: string } | { kind: "temporary"; address: string } | { kind: "permanent" })

export type Tab = {
    id: string
    href: string
    previewPath?: string
    favicon?: string
    title: string
}

export type BannerInteractionDetails = {
    amountOfInteractions: number
}

// Reference to a bookmarked dApp using discriminated union for type safety
type AppHubReference = {
    type: "app-hub"
    id: string
    order: number
}

type VBDReference = {
    type: "vbd"
    vbdId: string
    order: number
}

type CustomURLReference = {
    type: "custom"
    url: string
    title: string
    description?: string
    iconUri?: string
    createAt: number
    order: number
}

export type DAppReference = AppHubReference | VBDReference | CustomURLReference

export type DiscoveryState = {
    featured: DiscoveryDApp[]
    favoriteRefs: DAppReference[]
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
    isNormalUser?: boolean
    suggestedAppIds?: string[]
    lastNavigationSource?: string
}

export const initialDiscoverState: DiscoveryState = {
    featured: [],
    favoriteRefs: [],
    custom: [],
    hasOpenedDiscovery: false,
    connectedApps: [],
    tabsManager: {
        currentTabId: null,
        tabs: [],
    },
    bannerInteractions: {},
    isNormalUser: false,
}

const findByHref = (dapps: DiscoveryDApp[], href: string) => {
    return dapps.find(dapp => URIUtils.compareURLs(dapp.href, href))
}

// Convert dApp to appropriate reference type based on its source
const createDAppReference = (dapp: DiscoveryDApp, order: number): DAppReference => {
    // Custom URL bookmark
    if (dapp.isCustom) {
        return {
            type: "custom",
            url: dapp.href,
            title: dapp.name,
            description: dapp.desc,
            iconUri: dapp.iconUri,
            createAt: dapp.createAt,
            order,
        }
    }

    // VeBetterDAO bookmark
    if (dapp.veBetterDaoId) {
        return {
            type: "vbd",
            vbdId: dapp.veBetterDaoId,
            order,
        }
    }

    // App Hub bookmark
    return {
        type: "app-hub",
        id: dapp.id || DAppUtils.generateDAppId(dapp.href),
        order,
    }
}

export const DiscoverySlice = createSlice({
    name: "discovery",
    initialState: initialDiscoverState,
    reducers: {
        addBookmark: (state, action: PayloadAction<DiscoveryDApp | VbdDApp>) => {
            const { payload } = action
            let bookmark: DiscoveryDApp
            if ("external_url" in payload) {
                // Handle both Unix timestamp string ("1640995200") and ISO string formats
                const timestamp = Number.parseInt(payload.createdAtTimestamp, 10)
                const createAt = Number.isNaN(timestamp) ? Date.parse(payload.createdAtTimestamp) : timestamp * 1000

                bookmark = {
                    name: payload.name,
                    href: payload.external_url,
                    desc: payload.description,
                    isCustom: false,
                    createAt,
                    amountOfNavigations: 1,
                    veBetterDaoId: payload.id,
                }
            } else {
                bookmark = {
                    ...payload,
                }
            }

            // Add to favoriteRefs for all bookmark types (app-hub, vbd, custom)
            const order = state.favoriteRefs.length
            state.favoriteRefs.push(createDAppReference(bookmark, order))
        },
        removeBookmark: (state, action: PayloadAction<{ href: string; isCustom?: boolean }>) => {
            const { isCustom, href } = action.payload

            if (isCustom) {
                state.favoriteRefs = state.favoriteRefs.filter(
                    ref => !(ref.type === "custom" && URIUtils.compareURLs(ref.url, href)),
                )
                return
            }

            // For non-custom bookmarks, find the dApp to get its ID
            const dapp = state.featured.find(d => URIUtils.compareURLs(d.href, href))
            if (!dapp) return

            state.favoriteRefs = state.favoriteRefs.filter(ref => {
                if (ref.type === "app-hub") return ref.id !== dapp.id
                if (ref.type === "vbd") return ref.vbdId !== dapp.veBetterDaoId
                return true
            })
        },
        reorderBookmarks: (state, action: PayloadAction<DiscoveryDApp[]>) => {
            state.favoriteRefs = action.payload.map((dapp, index) => createDAppReference(dapp, index))
        },
        setFeaturedDApps: (state, action: PayloadAction<DiscoveryDApp[]>) => {
            state.featured = action.payload
        },
        addNavigationToDApp: (state, action: PayloadAction<{ href: string; isCustom: boolean }>) => {
            const { payload } = action

            // Only track navigation counts for featured apps (non-custom)
            if (!payload.isCustom) {
                const featured = findByHref(state.featured, payload.href)
                if (featured) {
                    featured.amountOfNavigations += 1
                }
            }
        },
        // Store the source screen for back navigation
        setLastNavigationSource: (state, action: PayloadAction<{ screen: string }>) => {
            state.lastNavigationSource = action.payload.screen
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
                state.tabsManager.tabs[tabIndex] = { ...state.tabsManager.tabs[tabIndex], ...otherProps }
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
            delete state.sessions?.[new URL(action.payload).origin]
        },
        addSession(state, action: PayloadAction<LoginSession>) {
            const parsedUrl = new URL(action.payload.url)
            if (!state.sessions) state.sessions = {}
            state.sessions[parsedUrl.origin] = { ...action.payload, url: parsedUrl.origin }
        },
        setIsNormalUser: state => {
            state.isNormalUser = true
        },
        setSuggestedAppIds: (state, action: PayloadAction<string[]>) => {
            state.suggestedAppIds = action.payload
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
    setIsNormalUser,
    setSuggestedAppIds,
    setLastNavigationSource,
} = DiscoverySlice.actions
