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
    [UserPreferencesSlice.name]: UserPreferencesSlice.reducer,
    [ConfigSlice.name]: ConfigSlice.reducer,
    [DeviceSlice.name]: DeviceSlice.reducer,
    [AccountSlice.name]: AccountSlice.reducer,
    [NetworkSlice.name]: NetworkSlice.reducer,
    [BalanceSlice.name]: BalanceSlice.reducer,
    [CacheSlice.name]: CacheSlice.reducer,
    [ContactsSlice.name]: ContactsSlice.reducer,
    [ActivitiesSlice.name]: ActivitiesSlice.reducer,
})
