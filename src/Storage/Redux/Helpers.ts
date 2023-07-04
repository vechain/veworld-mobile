import { warn } from "~Utils"
import { encryptTransform, initEncryption } from "./EncryptionService"
import { storage } from "./Storage"
import {
    CurrencySlice,
    TokenSlice,
    UserPreferencesSlice,
    ConfigSlice,
    DeviceSlice,
    AccountSlice,
    NetworkSlice,
    BalanceSlice,
    ContactsSlice,
    ActivitiesSlice,
    DelegationSlice,
    WalletConnectSessionsSlice,
    NftSlice,
    resetAccountState,
    resetActivityState,
    resetBalancesState,
    resetCacheState,
    resetConfigState,
    resetContactsState,
    resetCurrencyState,
    resetDelegationState,
    resetDeviceState,
    resetNetworkState,
    resetNftState,
    resetTokensState,
    resetUserPreferencesState,
    resetWalletConnectState,
} from "./Slices"

export const nftPersistConfig = {
    key: NftSlice.name,
    storage: storage,
    whitelist: ["blackListedCollectionsPerAccount"],
}

export const getPersistorConfig = async () => {
    const key = await initEncryption()

    const encryptor = encryptTransform({
        secretKey: key,
        onError: function (error) {
            warn(error)
        },
    })

    const persistConfig = {
        key: "root",
        storage,
        version: 1,
        blacklist: [NftSlice.name],
        whitelist: [
            CurrencySlice.name,
            TokenSlice.name,
            UserPreferencesSlice.name,
            ConfigSlice.name,
            DeviceSlice.name,
            AccountSlice.name,
            NetworkSlice.name,
            BalanceSlice.name,
            ContactsSlice.name,
            ActivitiesSlice.name,
            DelegationSlice.name,
            WalletConnectSessionsSlice.name,
        ],
        transforms: [encryptor],
    }

    return persistConfig
}

// This combines all reset actions from all slices
// Remember to add new reset actions here of any new persisted Slice
export const resetActions = [
    resetAccountState,
    resetActivityState,
    resetBalancesState,
    resetCacheState,
    resetConfigState,
    resetContactsState,
    resetCurrencyState,
    resetDelegationState,
    resetDeviceState,
    resetNetworkState,
    resetNftState,
    resetTokensState,
    resetUserPreferencesState,
    resetWalletConnectState,
]
