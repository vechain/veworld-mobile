import { combineReducers } from "redux"
import { UserPreferencesSlice, ConfigSlice } from "./Slices"

export const reducer = combineReducers({
    userPreferences: UserPreferencesSlice.reducer,
    config: ConfigSlice.reducer,
})
