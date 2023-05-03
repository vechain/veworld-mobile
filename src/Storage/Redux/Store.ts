import { combineReducers } from "redux"
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
