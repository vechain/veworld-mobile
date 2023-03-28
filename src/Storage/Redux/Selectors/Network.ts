import { createSelector } from "@reduxjs/toolkit"
import { RootState } from "../Types"

const reducer = (state: RootState) => state.networks

export const getSelectedNetwork = createSelector(reducer, state => {
    return state.selectedNetwork
})

export const getNetworks = createSelector(reducer, state => {
    return state.customNetworks
})

export const getShowConversionOnOtherNets = createSelector(reducer, state => {
    return state.showConversionOtherNets
})

export const getShowTestnetTag = createSelector(reducer, state => {
    return state.showTestNetTag
})
