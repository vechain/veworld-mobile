import { combineReducers } from "redux"
import {
    DeviceSlice,
    UserPreferencesSlice,
    ConfigSlice,
    AccountSlice,
    TokenSlice,
    BalanceSlice,
    NetworkSlice,
    CacheSlice,
} from "./Slices"

export const reducer = combineReducers({
    userPreferences: UserPreferencesSlice.reducer,
    config: ConfigSlice.reducer,
    devices: DeviceSlice.reducer,
    accounts: AccountSlice.reducer,
    networks: NetworkSlice.reducer,
    tokens: TokenSlice.reducer,
    balances: BalanceSlice.reducer,
    cache: CacheSlice.reducer,
})
