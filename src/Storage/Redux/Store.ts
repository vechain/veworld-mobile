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
    DiscoverySlice,
    NetworkSlice,
    NftSlice,
    NftSliceState,
    PendingSlice,
    TokenSlice,
    UserPreferencesSlice,
    WalletConnectSessionsSlice,
    AnalyticsSlice,
    BrowserSlice,
} from "./Slices"
import { persistReducer } from "redux-persist"
import { PersistConfig } from "redux-persist/es/types"
import { FlowsTrackerSlice } from "./Slices/FlowsTracker"

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
        [DiscoverySlice.name]: DiscoverySlice.reducer,
        [AnalyticsSlice.name]: AnalyticsSlice.reducer,
        [BrowserSlice.name]: BrowserSlice.reducer,
        [FlowsTrackerSlice.name]: FlowsTrackerSlice.reducer,
    })
