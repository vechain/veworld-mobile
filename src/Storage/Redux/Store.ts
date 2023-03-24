import { combineReducers } from "redux"
import { DeviceSlice, UserPreferencesSlice } from "./Slices"

export const reducer = combineReducers({
    userPreferences: UserPreferencesSlice.reducer,
    devices: DeviceSlice.reducer,
})
