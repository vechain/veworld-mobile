import { createSelector } from "@reduxjs/toolkit"
import { RootState } from "../Store"

const reducer = (state: RootState) => state.userPreferences

export const selectTheme = createSelector(reducer, state => {
    return state.theme
})
