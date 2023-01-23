import { CryptoUtils } from "~Common"
import { AsyncStore, KeychainStore } from "~Storage/Stores"
import { AsyncStoreType, error } from "~Common"

const getOrGenerateEncryptionKey = async (accessControl: boolean) => {
    /*
            KEY CREATION FLOW
                check if flag exists in async storage
                    if yes
                        get key from keychain to decrypt wallet
                    if not
                        create key
    */

    try {
        let isKey = await AsyncStore.getFor<string>(
            AsyncStoreType.isEncryptionKey,
        )

        if (isKey) {
            let userCreds = await KeychainStore.get(
                "VeWorld_Wallet_key",
                accessControl,
            )
            if (userCreds) {
                return userCreds.password
            }
        } else {
            let key = CryptoUtils.getRandomKey()
            return key
        }
    } catch (err) {
        error(err)
    }
}

const setEncryptionKey = async (key: string, accessControl: boolean) => {
    try {
        KeychainStore.set<string>("VeWorld_Wallet_key", key, accessControl)
    } catch (err) {
        error(err)
    }
}

export default { getOrGenerateEncryptionKey, setEncryptionKey }
