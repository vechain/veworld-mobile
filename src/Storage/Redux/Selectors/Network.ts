import { createSelector } from "@reduxjs/toolkit"
import { defaultNetworks } from "~Common/Constant/Thor/ThorConstants"
import { RootState } from "../Types"

const reducer = (state: RootState) => state.networks

export const selectSelectedNetwork = createSelector(reducer, state => {
    return state.selectedNetwork
})

export const selectDefaultNetworks = createSelector(reducer, _state => {
    return defaultNetworks
})

export const selectNetworks = createSelector(
    reducer,
    selectDefaultNetworks,
    (state, defaultNets) => {
        return defaultNets.concat(state.customNetworks)
    },
)

export const selectCustomNetworks = createSelector(reducer, state => {
    return state.customNetworks
})

export const selectShowConversionOnOtherNets = createSelector(
    reducer,
    state => {
        return state.showConversionOtherNets
    },
)

export const selectShowTestnetTag = createSelector(reducer, state => {
    return state.showTestNetTag
})
