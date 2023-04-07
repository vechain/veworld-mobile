import { createSelector } from "@reduxjs/toolkit"
import { RootState } from "../Types"

const selectTokenState = (state: RootState) => state.tokens

export const selectCustomTokens = createSelector(selectTokenState, state => {
    return state.custom
})
