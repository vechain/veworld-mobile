import { createSelector } from "@reduxjs/toolkit"
import { defaultMainNetwork, defaultNetworks } from "~Constants"
import { RootState } from "../Types"
import { Network, NETWORK_TYPE, NetworkHardFork } from "~Model"

const selectNetworksState = (state: RootState) => state.networks

export const selectDefaultNetworks = createSelector(selectNetworksState, _state => {
    return defaultNetworks
})

export const selectDefaultMainnet = createSelector(selectDefaultNetworks, defaults => {
    return defaults.find(u => u.type === NETWORK_TYPE.MAIN)!
})

// is type redundant? should we check for genesisid directly?
export const selectNetworksByType = (type: NETWORK_TYPE) =>
    createSelector(selectNetworks, state => {
        return state.filter(net => net.type === type)
    })

export const selectNetworks = createSelector(selectNetworksState, selectDefaultNetworks, (state, defaultNets) => {
    return defaultNets.concat(state.customNetworks)
})

export const selectCustomNetworks = createSelector(selectNetworksState, state => {
    return state.customNetworks
})

export const selectSelectedNetwork = createSelector(
    selectNetworksState,
    selectNetworks,
    (state, networks) => networks.find(net => net.id === state.selectedNetwork) ?? defaultMainNetwork,
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

export const selectIsNodeError = createSelector(selectNetworksState, state => {
    return state.isNodeError
})

export const selectSelectedNetworkHardfork = createSelector(
    [selectSelectedNetwork, selectNetworksState],
    (network, networks) => networks.hardfork[network.genesis.id] ?? NetworkHardFork.FINALITY,
)

export const selectNetworkHardfork = createSelector(
    [selectNetworksState, (_state: RootState, network: Network) => network],
    (networks, network) => networks.hardfork[network.genesis.id] ?? NetworkHardFork.FINALITY,
)
