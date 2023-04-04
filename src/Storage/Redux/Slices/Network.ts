import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { PURGE } from "redux-persist"
import { defaultMainNetwork } from "~Common/Constant/Thor/ThorConstants"
import { Network } from "~Model"

export interface NetworkState {
    selectedNetwork: Network
    customNetworks: Network[]
    showTestNetTag: boolean
    showConversionOtherNets: boolean
}

const initialState: NetworkState = {
    selectedNetwork: defaultMainNetwork,
    customNetworks: [],
    showTestNetTag: true,
    showConversionOtherNets: true,
}

export const NetworkSlice = createSlice({
    name: "network",
    initialState,
    reducers: {
        changeSelectedNetwork: (state, action: PayloadAction<Network>) => {
            state.selectedNetwork = action.payload
        },

        addCustomNetwork: (state, action: PayloadAction<Network>) => {
            state.customNetworks.push(action.payload)
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
    toggleShowTestnetTag,
    toggleShowConversionOtherNetworks,
} = NetworkSlice.actions
