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
        const dapps = [...favorites]

        for (const dapp of custom) {
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
