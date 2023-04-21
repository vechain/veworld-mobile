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
    ContactsSlice,
    TokenSlice,
    CurrencySlice,
    ActivitiesSlice,
} from "./Slices"

export const reducer = combineReducers({
    [TokenApi.reducerPath]: TokenApi.reducer,
    [CurrencySlice.name]: CurrencySlice.reducer,
    [TokenSlice.name]: TokenSlice.reducer,
    userPreferences: UserPreferencesSlice.reducer,
    config: ConfigSlice.reducer,
    devices: DeviceSlice.reducer,
    accounts: AccountSlice.reducer,
    networks: NetworkSlice.reducer,
    balances: BalanceSlice.reducer,
    cache: CacheSlice.reducer,
    contacts: ContactsSlice.reducer,
    activities: ActivitiesSlice.reducer,
})
