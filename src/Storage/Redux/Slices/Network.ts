import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { PURGE } from "redux-persist"
import { defaultMainNetwork } from "~Common/Constant/Thor/ThorConstants"
import { Network } from "~Model"

export interface NetworkState {
    selectedNetwork: string
    customNetworks: Network[]
    showTestNetTag: boolean
    showConversionOtherNets: boolean
}

const initialState: NetworkState = {
    selectedNetwork: defaultMainNetwork.id,
    customNetworks: [],
    showTestNetTag: true,
    showConversionOtherNets: true,
}

export const NetworkSlice = createSlice({
    name: "network",
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
    },
    extraReducers: builder => {
        builder.addCase(PURGE, () => initialState)
    },
})

export const {
    changeSelectedNetwork,
    addCustomNetwork,
    updateCustomNetwork,
    removeCustomNetwork,
    toggleShowTestnetTag,
    toggleShowConversionOtherNetworks,
} = NetworkSlice.actions
