import { StorageEncryptionKeys } from "~Components/Providers/EncryptedStorageProvider/Model"
import { Keychain } from "~Storage"
import { CryptoUtils, HexUtils } from "~Utils"
import SaltHelper from "./SaltHelper"
import { ACCESS_CONTROL, Options } from "react-native-keychain"

const PIN_CODE_STORAGE = "ENCRYPTION_KEY_STORAGE"
const BIOMETRIC_KEY_STORAGE = "BIOMETRIC_KEY_STORAGE"

const get = async (pinCode?: string): Promise<StorageEncryptionKeys> => {
    const keys = await Keychain.get({
        key: pinCode ? PIN_CODE_STORAGE : BIOMETRIC_KEY_STORAGE,
        options: {
            accessControl: pinCode ? undefined : ACCESS_CONTROL.BIOMETRY_ANY,
        },
    })

    if (!keys) throw new Error("No key found")

    if (pinCode) {
        const salt = await SaltHelper.getSalt()
        return CryptoUtils.decrypt(keys, pinCode, salt) as StorageEncryptionKeys
    } else {
        return JSON.parse(keys) as StorageEncryptionKeys
    }
}

const setWithPinCode = async (
    encryptionKeys: StorageEncryptionKeys,
    pinCode: string,
) => {
    const salt = await SaltHelper.getSalt()

    const encryptedKeys = CryptoUtils.encrypt(encryptionKeys, pinCode, salt)

    await Keychain.set({
        key: PIN_CODE_STORAGE,
        value: encryptedKeys,
    })
}

const setWithBiometric = async (encryptionKeys: StorageEncryptionKeys) => {
    const encryptedKeys = JSON.stringify(encryptionKeys)

    const options: Options = {
        accessControl: ACCESS_CONTROL.BIOMETRY_ANY,
    }

    await Keychain.set({
        key: BIOMETRIC_KEY_STORAGE,
        options,
        value: encryptedKeys,
    })
}

const set = async (encryptionKeys: StorageEncryptionKeys, pinCode?: string) => {
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
        })

        if (!keys) throw new Error("No key found")

        const salt = await SaltHelper.getSalt()

        const decryptedKeys = CryptoUtils.decrypt(
            keys,
            pinCode,
            salt,
        ) as StorageEncryptionKeys

        return !!decryptedKeys && !!decryptedKeys.redux
    } catch (e) {
        return false
    }
}

const remove = async () => {
    await Keychain.deleteItem({
        key: BIOMETRIC_KEY_STORAGE,
    })

    await Keychain.deleteItem({
        key: PIN_CODE_STORAGE,
    })
}

const init = async (pinCode?: string) => {
    await remove()

    const encryptionKeys: StorageEncryptionKeys = {
        redux: HexUtils.generateRandom(256),
        images: HexUtils.generateRandom(8),
        metadata: HexUtils.generateRandom(8),
    }

    await set(encryptionKeys, pinCode)

    return encryptionKeys
}

export default {
    init,
    get,
    set,
    remove,
    validatePinCode,
}
