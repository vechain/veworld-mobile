import { combineReducers } from "redux"
import {
    AccountSlice,
    ActivitiesSlice,
    BalanceSlice,
    BeatSlice,
    CacheSlice,
    ContactsSlice,
    CurrencySlice,
    DelegationSlice,
    DeviceSlice,
    NetworkSlice,
    NftSlice,
    NftSliceState,
    PendingSlice,
    TokenSlice,
    UserPreferencesSlice,
    WalletConnectSessionsSlice,
} from "./Slices"
import { persistReducer } from "redux-persist"
import { PersistConfig } from "redux-persist/es/types"

export const reducer = (nftPersistConfig: PersistConfig<NftSliceState>) =>
    combineReducers({
        [CurrencySlice.name]: CurrencySlice.reducer,
        [TokenSlice.name]: TokenSlice.reducer,
        [UserPreferencesSlice.name]: UserPreferencesSlice.reducer,
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
    })
