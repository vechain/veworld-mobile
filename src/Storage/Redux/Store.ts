import { combineReducers } from "redux"
import { DeviceSlice, UserPreferencesSlice } from "./Slices"
import { AccountSlice } from "./Slices/Account"

export const reducer = combineReducers({
    userPreferences: UserPreferencesSlice.reducer,
    devices: DeviceSlice.reducer,
    accounts: AccountSlice.reducer,
})
