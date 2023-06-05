import { createSelector } from "@reduxjs/toolkit"
import { RootState } from "../Types"

export const selectDelegationState = (state: RootState) => state.delegation

export const selectDelegationUrls = createSelector(
    selectDelegationState,
    delegation => delegation.urls,
)

export const getDefaultDelegationOption = createSelector(
    selectDelegationState,
    delegation => delegation.defaultDelegationOption,
)

export const getDefaultDelegationAccount = createSelector(
    selectDelegationState,
    delegation => delegation.defaultDelegationAccount,
)

export const getDefaultDelegationUrl = createSelector(
    selectDelegationState,
    delegation => delegation.defaultDelegationUrl,
)
