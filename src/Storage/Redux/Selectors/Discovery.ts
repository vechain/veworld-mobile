import { RootState } from "../Types"
import { createSelector } from "@reduxjs/toolkit"
import { DiscoveryDApp } from "~Constants"
import { URIUtils } from "~Utils"

const getDiscoveryState = (state: RootState) => state.discovery

export const selectFavoritesDapps = createSelector(
    getDiscoveryState,
    (discovery): DiscoveryDApp[] => discovery.favorites,
)

export const selectFeaturedDapps = createSelector(getDiscoveryState, (discovery): DiscoveryDApp[] => discovery.featured)

export const selectCustomDapps = createSelector(getDiscoveryState, (discovery): DiscoveryDApp[] => discovery.custom)

export const selectBookmarkedDapps = createSelector(
    selectFavoritesDapps,
    (favorites: DiscoveryDApp[]): DiscoveryDApp[] => {
        const dapps: DiscoveryDApp[] = []

        for (const dapp of favorites) {
            if (!dapps.find(d => URIUtils.compareURLs(d.href, dapp.href))) {
                dapps.push(dapp)
            }
        }

        return dapps
    },
)

export const selectAllDapps = createSelector(
    selectFavoritesDapps,
    selectFeaturedDapps,
    selectCustomDapps,
    (favorites, featured, custom) => {
        const dapps = [...favorites]

        for (const dapp of custom) {
            if (!dapps.find(d => URIUtils.compareURLs(d.href, dapp.href))) {
                dapps.push(dapp)
            }
        }

        for (const dapp of featured) {
            if (!dapps.find(d => URIUtils.compareURLs(d.href, dapp.href))) {
                dapps.push(dapp)
            }
        }

        return dapps
    },
)

export const selectHasUserOpenedDiscovery = createSelector(
    getDiscoveryState,
    (discovery): boolean => discovery.hasOpenedDiscovery,
)

export const selectConnectedDiscoverDApps = createSelector(getDiscoveryState, discovery => discovery.connectedApps)

export const selectSwapFeaturedDapps = createSelector(selectFeaturedDapps, dapps =>
    dapps.filter(dapp => dapp?.tags?.map(t => t.toLowerCase())?.includes("swap")),
)

export const selectTabs = createSelector(getDiscoveryState, discovery => discovery.tabsManager.tabs)

export const selectCurrentTabId = createSelector(getDiscoveryState, discovery => discovery.tabsManager.currentTabId)

export const selectCurrentTab = createSelector(selectTabs, selectCurrentTabId, (tabs, currentTabId) =>
    tabs.find(tab => tab.id === currentTabId),
)
export const selectBannerInteractions = createSelector(getDiscoveryState, discovery => discovery.bannerInteractions)

export const selectSession = createSelector(
    getDiscoveryState,
    (_: RootState, url: string, genesisId?: string) => ({ url, genesisId }),
    (state, { url, genesisId }) => {
        if (!url) return undefined
        const session = state.sessions?.[new URL(url).origin]
        if (!genesisId) return session
        if (session?.genesisId?.toLowerCase() === genesisId) return session
        return undefined
    },
)

export const selectSessions = createSelector(getDiscoveryState, state => {
    return state.sessions ?? {}
})
