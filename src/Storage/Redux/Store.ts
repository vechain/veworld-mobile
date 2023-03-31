import { combineReducers } from "redux"
import { TokenApi } from "./Api"
import {
    DeviceSlice,
    UserPreferencesSlice,
    ConfigSlice,
    AccountSlice,
    BalanceSlice,
    NetworkSlice,
    CacheSlice,
} from "./Slices"

export const reducer = combineReducers({
    [TokenApi.reducerPath]: TokenApi.reducer,
    userPreferences: UserPreferencesSlice.reducer,
    config: ConfigSlice.reducer,
    devices: DeviceSlice.reducer,
    accounts: AccountSlice.reducer,
    networks: NetworkSlice.reducer,
    balances: BalanceSlice.reducer,
    cache: CacheSlice.reducer,
})
