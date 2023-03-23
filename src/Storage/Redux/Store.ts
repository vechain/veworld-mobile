import { combineReducers } from "redux"
import {
    UserPreferencesSlice,
    TokenCacheSlice,
    BalanceSlice,
    AccountTokenSlice,
    ConfigSlice,
} from "./Slices"

export const reducer = combineReducers({
    userPreferences: UserPreferencesSlice.reducer,
    tokenCache: TokenCacheSlice.reducer,
    balances: BalanceSlice.reducer,
    accountTokens: AccountTokenSlice.reducer,
    config: ConfigSlice.reducer,
})
