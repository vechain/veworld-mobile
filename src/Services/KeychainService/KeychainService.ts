import { AsyncStore, KeychainStore } from "~Storage/Stores"
import { AsyncStoreType, error, CryptoUtils } from "~Common"

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
            AsyncStoreType.IsEncryptionKey,
        )

        if (isKey) {
            let encKey = await KeychainStore.get(accessControl)
            if (encKey) {
                return encKey
            }
        } else {
            let key = CryptoUtils.getRandomKey()
            return key
        }
    } catch (err) {
        error(err)
    }
}

const setEncryptionKey = async (Enckey: string, accessControl: boolean) => {
    try {
        await KeychainStore.set(Enckey, accessControl)
    } catch (err) {
        error(err)
    }
}

const removeEncryptionKey = async () => {
    try {
        await KeychainStore.remove()
    } catch (err) {
        error(err)
    }
}

export default {
    getOrGenerateEncryptionKey,
    setEncryptionKey,
    removeEncryptionKey,
}
