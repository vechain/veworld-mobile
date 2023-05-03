import { createSelector } from "@reduxjs/toolkit"
import {
    defaultMainNetwork,
    defaultNetworks,
} from "~Common/Constant/Thor/ThorConstants"
import { RootState } from "../Types"
import { NETWORK_TYPE } from "~Model"

const selectNetworksState = (state: RootState) => state.networks

export const selectDefaultNetworks = createSelector(
    selectNetworksState,
    _state => {
        return defaultNetworks
    },
)

// is type reduntant? should we check for genesisid directly?
export const selectNetworksByType = (type: NETWORK_TYPE) =>
    createSelector(selectNetworks, state => {
        return state.filter(net => net.type === type)
    })

export const selectNetworks = createSelector(
    selectNetworksState,
    selectDefaultNetworks,
    (state, defaultNets) => {
        return defaultNets.concat(state.customNetworks)
    },
)

export const selectCustomNetworks = createSelector(
    selectNetworksState,
    state => {
        return state.customNetworks
    },
)

export const selectSelectedNetwork = createSelector(
    selectNetworksState,
    selectNetworks,
    (state, networks) => {
        return (
            networks.find(net => net.id === state.selectedNetwork) ||
            defaultMainNetwork
        )
    },
)

export const selectNetworkById = (id?: string) =>
    createSelector(selectNetworks, networks => {
        return networks.find(net => net.id === id)
    })

export const selectShowConversionOnOtherNets = createSelector(
    selectNetworksState,
    state => {
        return state.showConversionOtherNets
    },
)

export const selectShowTestnetTag = createSelector(
    selectNetworksState,
    state => {
        return state.showTestNetTag
    },
)

export const selectIsNodeError = createSelector(selectNetworksState, state => {
    return state.isNodeError
})
