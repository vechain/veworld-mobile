import { combineReducers } from "redux"
import { UserPreferencesSlice } from "./Slices"

export const reducer = combineReducers({
    userPreferences: UserPreferencesSlice.reducer,
})
