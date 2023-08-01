import { createSelector } from "@reduxjs/toolkit"
import { RootState } from "../Types"
import { selectSelectedNetwork } from "./Network"
import { DelegationType } from "~Model/Delegation"

export const selectDelegationState = (state: RootState) => state.delegation

export const selectDelegationUrls = createSelector(
    selectSelectedNetwork,
    selectDelegationState,
    (network, delegation) => {
        if (!delegation[network.genesis.id]) return []

        return delegation[network.genesis.id].urls
    },
)

export const getDefaultDelegationOption = createSelector(
    selectSelectedNetwork,
    selectDelegationState,
    (network, delegation) => {
        if (!delegation[network.genesis.id]) return DelegationType.NONE

        return delegation[network.genesis.id].defaultDelegationOption
    },
)

export const getDefaultDelegationAccount = createSelector(
    selectSelectedNetwork,
    selectDelegationState,
    (network, delegation) =>
        delegation[network.genesis.id]?.defaultDelegationAccount,
)

export const getDefaultDelegationUrl = createSelector(
    selectSelectedNetwork,
    selectDelegationState,
    (network, delegation) =>
        delegation[network.genesis.id]?.defaultDelegationUrl,
)
