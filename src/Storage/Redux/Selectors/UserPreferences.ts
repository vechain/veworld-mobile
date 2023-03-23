import { createSelector } from "@reduxjs/toolkit"
import { RootState } from "../Types"

const reducer = (state: RootState) => state.userPreferences

export const selectTheme = createSelector(reducer, state => {
    return state.theme
})
