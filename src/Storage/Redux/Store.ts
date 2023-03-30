import { combineReducers } from "redux"
import { TokenApi } from "./Api"
import { UserPreferencesSlice, BalanceSlice, ConfigSlice } from "./Slices"

export const reducer = combineReducers({
    [TokenApi.reducerPath]: TokenApi.reducer,
    userPreferences: UserPreferencesSlice.reducer,
    balances: BalanceSlice.reducer,
    config: ConfigSlice.reducer,
})
