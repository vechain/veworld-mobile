import { combineReducers } from "redux"
import {
    UserPreferencesSlice,
    TokenSlice,
    BalanceSlice,
    ConfigSlice,
} from "./Slices"

export const reducer = combineReducers({
    userPreferences: UserPreferencesSlice.reducer,
    tokens: TokenSlice.reducer,
    balances: BalanceSlice.reducer,
    config: ConfigSlice.reducer,
})
