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
    DelegationSlice,
    NftSlice,
    WalletConnectSessionsSlice,
} from "./Slices"

export const reducer = combineReducers({
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
    [DelegationSlice.name]: DelegationSlice.reducer,
    [NftSlice.name]: NftSlice.reducer,
    [WalletConnectSessionsSlice.name]: WalletConnectSessionsSlice.reducer,
})
