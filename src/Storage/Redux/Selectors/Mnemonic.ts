import { createSelector } from "@reduxjs/toolkit"
import { RootState } from "../Types"

const reducer = (state: RootState) => state.mnemonic

/**
 * @returns the cached mnemonic
 */
export const getMnemonic = createSelector(reducer, state => {
    return state
})
