import { createSelector } from "@reduxjs/toolkit"
import { RootState } from "../Types"

export const selectDelegationState = (state: RootState) => state.delegation

export const selectDelegationUrls = createSelector(
    selectDelegationState,
    delegation => delegation.urls,
)
