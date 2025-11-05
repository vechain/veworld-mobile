import { RootState } from "../Types"
import { createSelector } from "@reduxjs/toolkit"
import _ from "lodash"
import { DiscoveryDApp } from "~Constants"
import { resolveDAppsFromReferences } from "~Utils/DAppUtils/DAppBookmarkResolver"

const getDiscoveryState = (state: RootState) => state.discovery

export const selectFavoritesDapps = createSelector(
    getDiscoveryState,
    (discovery): DiscoveryDApp[] => discovery.favorites,
)

export const selectFeaturedDapps = createSelector(getDiscoveryState, (discovery): DiscoveryDApp[] => discovery.featured)

export const selectCustomDapps = createSelector(getDiscoveryState, (discovery): DiscoveryDApp[] => discovery.custom)

export const selectFavoriteRefs = createSelector(getDiscoveryState, discovery => discovery.favoriteRefs)

export const selectBookmarkedDapps = createSelector(
    selectFavoritesDapps,
    selectCustomDapps,
    selectFavoriteRefs,
    selectFeaturedDapps,
    (favorites, custom, favoriteRefs, featured): DiscoveryDApp[] => {
        if (favoriteRefs && favoriteRefs.length > 0) {
            const byId = new Map(featured.filter(d => d.id).map(d => [d.id!, d]))
            const byVbdId = new Map(featured.filter(d => d.veBetterDaoId).map(d => [d.veBetterDaoId!, d]))

            return resolveDAppsFromReferences(favoriteRefs, { byId, byVbdId })
        }

        const dapps: DiscoveryDApp[] = [...favorites, ...custom]
        return _.uniqBy(dapps, value => value.href)
    },
)

export const selectAllDapps = createSelector(
    selectFavoritesDapps,
    selectFeaturedDapps,
    selectCustomDapps,
    (favorites, featured, custom) => {
        // Use a Set to track normalized URLs for O(1) lookups
        const seenUrls = new Set<string>()
        const result: DiscoveryDApp[] = []

        // Helper to normalize URL for comparison
        const normalizeUrl = (url: string) => {
            try {
                const parsed = new URL(url.toLowerCase())
                parsed.hostname = parsed.hostname.replace("www.", "")
                return parsed.origin + parsed.pathname
            } catch {
                return url.toLowerCase()
            }
        }

        // Add favorites first (highest priority)
        for (const dapp of favorites) {
            const normalized = normalizeUrl(dapp.href)
            seenUrls.add(normalized)
            result.push(dapp)
        }

        // Add custom dapps (skip if URL already seen)
        for (const dapp of custom) {
            const normalized = normalizeUrl(dapp.href)
            if (!seenUrls.has(normalized)) {
                seenUrls.add(normalized)
                result.push(dapp)
            }
        }

        // Add all apps (skip if URL already seen)
        for (const dapp of featured) {
            const normalized = normalizeUrl(dapp.href)
            if (!seenUrls.has(normalized)) {
                seenUrls.add(normalized)
                result.push(dapp)
            }
        }

        return result
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

export const selectLastNavigationSource = createSelector(getDiscoveryState, discovery => discovery.lastNavigationSource)

export const selectCurrentTab = createSelector(selectTabs, selectCurrentTabId, (tabs, currentTabId) =>
    tabs.find(tab => tab.id === currentTabId),
)
export const selectBannerInteractions = createSelector(getDiscoveryState, discovery => discovery.bannerInteractions)

export const selectSession = createSelector(
    getDiscoveryState,
    (__: RootState, url: string, genesisId?: string) => ({ url, genesisId }),
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
export const selectIsNormalUser = createSelector(getDiscoveryState, state => state.isNormalUser ?? false)

export const selectSuggestedAppIds = createSelector(getDiscoveryState, state => state.suggestedAppIds)
