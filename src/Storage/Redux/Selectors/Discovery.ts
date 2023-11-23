import { RootState } from "../Types"
import { createSelector } from "@reduxjs/toolkit"
import { CompatibleDApps } from "~Constants"

const getDiscoveryState = (state: RootState) => state.discovery

export const selectFavoritesDapps = createSelector(getDiscoveryState, discovery => discovery.favorites)

export const selectFeaturedDapps = createSelector(getDiscoveryState, () => CompatibleDApps)

export const selectCustomDapps = createSelector(getDiscoveryState, discovery => discovery.custom)

export const selectBookmarkedDapps = createSelector(selectFavoritesDapps, selectCustomDapps, (favorites, custom) => {
    const dapps = [...favorites]

    for (const dapp of custom) {
        if (!dapps.find(d => d.id === dapp.id)) {
            dapps.push(dapp)
        }
    }

    return dapps
})

export const selectAllDapps = createSelector(
    selectFavoritesDapps,
    selectFeaturedDapps,
    selectCustomDapps,
    (favorites, featured, custom) => {
        const dapps = [...favorites]

        for (const dapp of custom) {
            if (!dapps.find(d => d.id === dapp.id)) {
                dapps.push(dapp)
            }
        }

        for (const dapp of featured) {
            if (!dapps.find(d => d.id === dapp.id)) {
                dapps.push(dapp)
            }
        }

        return dapps
    },
)
