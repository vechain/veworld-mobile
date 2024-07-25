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
    selectCustomDapps,
    (favorites, custom): DiscoveryDApp[] => {
        const dapps = [...custom]

        for (const dapp of favorites) {
            if (!dapps.find(d => URIUtils.compareURLs(d.href, dapp.href))) {
                dapps.push(dapp)
            }
        }

        return dapps.sort((a, b) => b.amountOfNavigations - a.amountOfNavigations)
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

export const selectFeaturedImages = createSelector(getDiscoveryState, discovery => {
    // domain -> image
    const images: Record<string, object | undefined> = {}

    for (const dapp of discovery.featured) {
        if (!dapp.image) continue

        try {
            images[new URL(dapp.href).host] = dapp.image
        } catch {}
    }

    return images
})

export const selectSwapFeaturedDapps = createSelector(selectFeaturedDapps, dapps => {
    return dapps.filter(
        dapp =>
            dapp?.name?.toLowerCase()?.includes("swap") ||
            dapp?.desc?.toLowerCase()?.includes("swap") ||
            dapp?.tags?.map(t => t.toLowerCase())?.includes("swap"),
    )
})
