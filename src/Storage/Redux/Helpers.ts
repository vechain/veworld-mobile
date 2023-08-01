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
    PendingSlice,
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
    resetPendingState,
} from "./Slices"

export const nftPersistConfig = {
    key: NftSlice.name,
    storage: storage,
    whitelist: ["blackListedCollectionsPerAccount"],
}

/**
 * Asynchronously generates and returns the configuration object for a Redux Persistor.
 * The object includes the key for encryption, storage engine, version number, blacklists, whitelists, and encryption transforms.
 *
 * @returns A `Promise` that resolves with the configuration object for a Redux Persistor.
 */
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
        blacklist: [NftSlice.name, PendingSlice.name],
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

/**
 * This is an array of all reset actions from every slice in the application.
 * Remember to add new reset actions here of any new persisted Slice.
 */
export const resetActions = [
    resetCurrencyState,
    resetActivityState,
    resetBalancesState,
    resetTokensState,
    resetAccountState,
    resetCacheState,
    resetContactsState,
    resetDelegationState,
    resetDeviceState,
    resetNetworkState,
    resetNftState,
    resetUserPreferencesState,
    resetWalletConnectState,
    resetPendingState,

    // Config reset always comes last
    resetConfigState,
]
