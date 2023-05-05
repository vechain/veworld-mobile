import { warn } from "~Common"
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
} from "./Slices"

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
        blacklist: [],
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
        ],
        transforms: [encryptor],
    }

    return persistConfig
}
