import { createSelector } from "@reduxjs/toolkit"
import { defaultMainNetwork, defaultNetworks } from "~Constants"
import { RootState } from "../Types"
import { NETWORK_TYPE } from "~Model"

const selectNetworksState = (state: RootState) => state.networks

export const selectDefaultNetworks = createSelector(
    selectNetworksState,
    _state => {
        return defaultNetworks
    },
)

// is type redundant? should we check for genesisid directly?
export const selectNetworksByType = (type: NETWORK_TYPE) =>
    createSelector(selectNetworks, state => {
        return state.filter(net => net.type === type)
    })

export const selectNetworks = createSelector(
    selectNetworksState,
    selectDefaultNetworks,
    (state, defaultNets) => {
        return state.customNetworks.concat(defaultNets)
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
    (state, networks) =>
        networks.find(net => net.id === state.selectedNetwork) ??
        defaultMainNetwork,
)

export const selectChainTag = createSelector(selectSelectedNetwork, network =>
    parseInt(network.genesis.id.slice(-2), 16),
)

export const selectNetworkById = createSelector(
    [selectNetworks, (state: RootState, id?: string) => id],
    (networks, id) => {
        return networks.find(net => net.id === id)
    },
)

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
