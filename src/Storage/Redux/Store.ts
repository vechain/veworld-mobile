import { combineReducers } from "redux"
import {
    AccountSlice,
    ActivitiesSlice,
    BalanceSlice,
    BeatSlice,
    CacheSlice,
    ConfigSlice,
    ContactsSlice,
    CurrencySlice,
    DelegationSlice,
    DeviceSlice,
    ImageCacheSlice,
    NetworkSlice,
    NftSlice,
    PendingSlice,
    TokenSlice,
    UserPreferencesSlice,
    WalletConnectSessionsSlice,
} from "./Slices"
import { nftPersistConfig } from "./Helpers"
import { persistReducer } from "redux-persist"

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
    [NftSlice.name]: persistReducer(nftPersistConfig, NftSlice.reducer), // persist specific keys from a reducer
    [WalletConnectSessionsSlice.name]: WalletConnectSessionsSlice.reducer,
    [PendingSlice.name]: PendingSlice.reducer,
    [BeatSlice.name]: BeatSlice.reducer,
    [ImageCacheSlice.name]: ImageCacheSlice.reducer,
})
