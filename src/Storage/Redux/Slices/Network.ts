import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { defaultMainNetwork } from "~Constants"
import { Network } from "~Model"

/**
 * Network state
 * @typedef {Object} NetworkState
 * @property {string} selectedNetwork - selected network id
 * @property {Network[]} customNetworks - custom networks
 * @property {boolean} showTestNetTag - show testnet tag
 * @property {boolean} showConversionOtherNets - show conversion for other networks
 * @property {boolean} isNodeError - is node error
 */
export interface NetworkState {
    selectedNetwork: string
    customNetworks: Network[]
    showTestNetTag: boolean
    showConversionOtherNets: boolean
    isNodeError: boolean
}

const initialState: NetworkState = {
    selectedNetwork: defaultMainNetwork.id,
    customNetworks: [],
    showTestNetTag: true,
    showConversionOtherNets: true,
    isNodeError: false,
}

export const NetworkSlice = createSlice({
    name: "networks",
    initialState,
    reducers: {
        changeSelectedNetwork: (state, action: PayloadAction<Network>) => {
            state.selectedNetwork = action.payload.id
        },

        addCustomNetwork: (state, action: PayloadAction<Network>) => {
            state.customNetworks.push(action.payload)
        },

        updateCustomNetwork: (
            state,
            action: PayloadAction<{ id: string; updatedNetwork: Network }>,
        ) => {
            const index = state.customNetworks.findIndex(
                net => net.id === action.payload.id,
            )
            if (index !== -1)
                state.customNetworks[index] = action.payload.updatedNetwork
        },
        removeCustomNetwork: (state, action: PayloadAction<{ id: string }>) => {
            const index = state.customNetworks.findIndex(
                net => net.id === action.payload.id,
            )
            if (index !== -1) state.customNetworks.splice(index, 1)
        },

        toggleShowTestnetTag: state => {
            state.showTestNetTag = !state.showTestNetTag
        },

        toggleShowConversionOtherNetworks: state => {
            state.showConversionOtherNets = !state.showConversionOtherNets
        },
        updateNodeError: (state, action: PayloadAction<boolean>) => {
            state.isNodeError = action.payload
        },
    },
})

export const {
    changeSelectedNetwork,
    addCustomNetwork,
    updateCustomNetwork,
    removeCustomNetwork,
    toggleShowTestnetTag,
    toggleShowConversionOtherNetworks,
    updateNodeError,
} = NetworkSlice.actions
