import { warn } from "~Utils"
import { encryptTransform } from "../../Services/EncryptionService/EncryptionService"
import {
    AccountSlice,
    ActivitiesSlice,
    BalanceSlice,
    ContactsSlice,
    CurrencySlice,
    DelegationSlice,
    DeviceSlice,
    NetworkSlice,
    NftSlice,
    PendingSlice,
    resetAccountState,
    resetActivityState,
    resetBalancesState,
    resetCacheState,
    resetContactsState,
    resetCurrencyState,
    resetDelegationState,
    resetDeviceState,
    resetNetworkState,
    resetNftState,
    resetPendingState,
    resetTokensState,
    resetUserPreferencesState,
    resetWalletConnectState,
    TokenSlice,
    UserPreferencesSlice,
    WalletConnectSessionsSlice,
} from "./Slices"
import { migrationUpdates } from "~Storage/Redux/Migrations"
import { createMigrate } from "redux-persist"
import { PersistConfig } from "redux-persist/es/types"
import { RootState } from "~Storage/Redux/Types"
import { newStorage } from "~Storage/Redux/Storage"
import { MMKV } from "react-native-mmkv"

// export const nftPersistConfig = {
//     key: NftSlice.name,
//     storage: storage,
//     whitelist: ["blackListedCollections"],
// }

/**
 * Asynchronously generates and returns the configuration object for a Redux Persistor.
 * The object includes the key for encryption, storage engine, version number, blacklists, whitelists, and encryption transforms.
 *
 * @returns A `Promise` that resolves with the configuration object for a Redux Persistor.
 */
export const getPersistorConfig = async (
    mmkv: MMKV,
    encryptionKey: string,
): Promise<PersistConfig<RootState>> => {
    let encryptor = encryptTransform({
        secretKey: encryptionKey,
        onError: function (error) {
            warn("encryptor", error)
        },
    })

    const storage = newStorage(mmkv)

    return {
        key: "root",
        storage,
        version: 3,
        blacklist: [NftSlice.name, PendingSlice.name],
        whitelist: [
            CurrencySlice.name,
            TokenSlice.name,
            UserPreferencesSlice.name,
            DeviceSlice.name,
            AccountSlice.name,
            NetworkSlice.name,
            BalanceSlice.name,
            ContactsSlice.name,
            ActivitiesSlice.name,
            DelegationSlice.name,
            WalletConnectSessionsSlice.name,
        ],
        migrate: createMigrate(migrationUpdates, { debug: true }),
        transforms: [encryptor],
    }
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
]
