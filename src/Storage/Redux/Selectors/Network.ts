import { createSelector } from "@reduxjs/toolkit"
import { defaultNetworks } from "~Common/Constant/Thor/ThorConstants"
import { RootState } from "../Types"

const reducer = (state: RootState) => state.networks

export const getSelectedNetwork = createSelector(reducer, state => {
    return state.selectedNetwork
})

export const getDefaultNetworks = createSelector(reducer, _state => {
    return defaultNetworks
})

export const getNetworks = createSelector(
    reducer,
    getDefaultNetworks,
    (state, defaultNets) => {
        return defaultNets.concat(state.customNetworks)
    },
)

export const getCustomNetworks = createSelector(reducer, state => {
    return state.customNetworks
})

export const getShowConversionOnOtherNets = createSelector(reducer, state => {
    return state.showConversionOtherNets
})

export const getShowTestnetTag = createSelector(reducer, state => {
    return state.showTestNetTag
})
