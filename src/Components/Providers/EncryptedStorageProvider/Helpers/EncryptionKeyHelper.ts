import { Keychain } from "~Storage"
import { EncryptionKeys } from "~Components/Providers/EncryptedStorageProvider/Model"
import { CryptoUtils, HexUtils } from "~Utils"
import { SecureStoreOptions } from "expo-secure-store/src/SecureStore"

const PIN_CODE_STORAGE = "ENCRYPTION_KEY_STORAGE"
const BIOMETRIC_KEY_STORAGE = "BIOMETRIC_KEY_STORAGE"

const get = async (pinCode?: string): Promise<EncryptionKeys> => {
    const keys = await Keychain.get({
        key: pinCode ? PIN_CODE_STORAGE : BIOMETRIC_KEY_STORAGE,
        options: {
            requireAuthentication: pinCode === undefined,
        },
    })

    if (!keys) throw new Error("No key found")

    if (pinCode) {
        return CryptoUtils.decrypt(keys, pinCode) as EncryptionKeys
    } else {
        return JSON.parse(keys) as EncryptionKeys
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
        key: PIN_CODE_STORAGE,
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
        key: BIOMETRIC_KEY_STORAGE,
        options,
        value: encryptedKeys,
    })
}

const set = async (encryptionKeys: EncryptionKeys, pinCode?: string) => {
    if (pinCode) {
        await setWithPinCode(encryptionKeys, pinCode)
    } else {
        await setWithBiometric(encryptionKeys)
    }
}

const validatePinCode = async (pinCode: string): Promise<boolean> => {
    try {
        const keys = await Keychain.get({
            key: PIN_CODE_STORAGE,
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

const remove = async () => {
    await Keychain.deleteItem({
        key: BIOMETRIC_KEY_STORAGE,
        options: {
            requireAuthentication: false,
        },
    })

    await Keychain.deleteItem({
        key: PIN_CODE_STORAGE,
        options: {
            requireAuthentication: false,
        },
    })
}

const init = async (pinCode?: string) => {
    await remove()

    const encryptionKeys: EncryptionKeys = {
        redux: HexUtils.generateRandom(256),
        images: HexUtils.generateRandom(8),
        metadata: HexUtils.generateRandom(8),
        walletKey: HexUtils.generateRandom(256),
    }

    await set(encryptionKeys, pinCode)
}

export default {
    init,
    get,
    set,
    remove,
    validatePinCode,
}
