import { warn } from "~Common"
import { encryptTransform, initEncryption } from "./EncryptionService"
import { storage } from "./Storage"

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
            "userPreferences",
            "config",
            "accounts",
            "devices",
            "networks",
            "balances",
            "contacts",
            "currency",
            "tokens",
            "activities",
        ],
        transforms: [encryptor],
    }

    return persistConfig
}
