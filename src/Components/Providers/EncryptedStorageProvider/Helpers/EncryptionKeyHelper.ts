import { SecurityLevelType } from "~Model"
import { CryptoUtils } from "~Utils"
import { SecureStoreOptions } from "expo-secure-store/src/SecureStore"

import { EncryptionKeys } from "~Components/Providers/EncryptedStorageProvider/Model"
import { Keychain } from "~Storage"

const ENCRYPTION_KEY_STORAGE = "ENCRYPTION_KEY_STORAGE"

type SecurityKeysResponse = {
    data: string
    type: SecurityLevelType
}
export const getEncryptionKeys = async (): Promise<SecurityKeysResponse> => {
    const keys = await Keychain.get({
        key: ENCRYPTION_KEY_STORAGE,
        options: {
            requireAuthentication: false,
        },
    })

    if (!keys) throw new Error("No key found")

    try {
        /**
         * If we can parse the keys, it means that they are not encrypted, and we retrieved with biometric
         */
        JSON.parse(keys)

        return {
            data: keys,
            type: SecurityLevelType.BIOMETRIC,
        }
    } catch (e) {
        return {
            data: keys,
            type: SecurityLevelType.SECRET,
        }
    }
}

const setWithPinCode = async (
    encryptionKeys: EncryptionKeys,
    pinCode: string,
) => {
    const encryptedKeys = CryptoUtils.encrypt(encryptionKeys, pinCode)

    const options: SecureStoreOptions = {
        requireAuthentication: false,
    }

    await Keychain.set({
        key: ENCRYPTION_KEY_STORAGE,
        options,
        value: encryptedKeys,
    })
}

const setWithBiometric = async (encryptionKeys: EncryptionKeys) => {
    const encryptedKeys = JSON.stringify(encryptionKeys)

    const options: SecureStoreOptions = {
        requireAuthentication: true,
    }

    await Keychain.set({
        key: ENCRYPTION_KEY_STORAGE,
        options,
        value: encryptedKeys,
    })
}

const setKeys = async (
    keys: EncryptionKeys,
    type: SecurityLevelType,
    pinCode?: string,
) => {
    if (type === SecurityLevelType.SECRET) {
        if (!pinCode) throw new Error("Pin code is required")
        await setWithPinCode(keys, pinCode)
    } else if (type === SecurityLevelType.BIOMETRIC) {
        await setWithBiometric(keys)
    } else {
        throw new Error(`Invalid security type ${type}`)
    }
}

const deleteKeys = async () => {
    await Keychain.deleteItem({
        key: ENCRYPTION_KEY_STORAGE,
    })
}

const validatePinCode = async (pinCode: string): Promise<boolean> => {
    try {
        const keys = await Keychain.get({
            key: ENCRYPTION_KEY_STORAGE,
            options: {
                requireAuthentication: false,
            },
        })

        if (!keys) throw new Error("No key found")

        const decryptedKeys = CryptoUtils.decrypt(
            keys,
            pinCode,
        ) as EncryptionKeys

        return !!decryptedKeys && !!decryptedKeys.redux
    } catch (e) {
        return false
    }
}

export default {
    setKeys,
    getEncryptionKeys,
    deleteKeys,
    validatePinCode,
}
