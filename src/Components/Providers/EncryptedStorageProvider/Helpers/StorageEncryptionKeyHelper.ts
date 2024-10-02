import { StorageEncryptionKeys } from "~Components/Providers/EncryptedStorageProvider/Model"
import { Keychain } from "~Storage"
import { CryptoUtils, CryptoUtils_Legacy, error, HexUtils, PasswordUtils } from "~Utils"
import SaltHelper from "./SaltHelper"
import { ACCESS_CONTROL, Options } from "react-native-keychain"
import { ERROR_EVENTS } from "~Constants"

const PIN_CODE_STORAGE = "ENCRYPTION_KEY_STORAGE"
const BIOMETRIC_KEY_STORAGE = "BIOMETRIC_KEY_STORAGE"

const get = async ({ pinCode, isLegacy }: { pinCode?: string; isLegacy?: boolean }): Promise<StorageEncryptionKeys> => {
    const keys = await Keychain.get({
        key: pinCode ? PIN_CODE_STORAGE : BIOMETRIC_KEY_STORAGE,
        options: {
            accessControl: pinCode ? undefined : ACCESS_CONTROL.BIOMETRY_ANY_OR_DEVICE_PASSCODE,
        },
    })

    if (!keys) throw new Error("StorageEncryptionKeyHelper -> get: No key found")

    if (pinCode) {
        const { salt, iv: base64IV } = await SaltHelper.getSaltAndIV()
        const iv = PasswordUtils.base64ToBuffer(base64IV)
        let decryptedKeys: StorageEncryptionKeys
        if (isLegacy) {
            decryptedKeys = await CryptoUtils_Legacy.decrypt(keys, pinCode, salt)
        } else {
            decryptedKeys = await CryptoUtils.decrypt(keys, pinCode, salt, iv)
        }
        return decryptedKeys
    } else {
        return JSON.parse(keys) as StorageEncryptionKeys
    }
}

const setWithPinCode = async (encryptionKeys: StorageEncryptionKeys, pinCode: string) => {
    const { salt, iv: base64IV } = await SaltHelper.getSaltAndIV()
    const iv = PasswordUtils.base64ToBuffer(base64IV)
    const encryptedKeys = await CryptoUtils.encrypt(encryptionKeys, pinCode, salt, iv)

    await Keychain.set({
        key: PIN_CODE_STORAGE,
        value: encryptedKeys,
    })
}

const setWithBiometric = async (encryptionKeys: StorageEncryptionKeys) => {
    const encryptedKeys = JSON.stringify(encryptionKeys)

    const options: Options = {
        accessControl: ACCESS_CONTROL.BIOMETRY_ANY_OR_DEVICE_PASSCODE,
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

const validatePinCode = async ({ pinCode, isLegacy }: { pinCode: string; isLegacy?: boolean }): Promise<boolean> => {
    try {
        const keys = await Keychain.get({
            key: PIN_CODE_STORAGE,
        })

        if (!keys) throw new Error("StorageEncryptionKeyHelper -> validatePinCode: No key found")

        const { salt, iv: base64IV } = await SaltHelper.getSaltAndIV()
        const iv = PasswordUtils.base64ToBuffer(base64IV)
        let decryptedKeys: StorageEncryptionKeys
        if (isLegacy) {
            decryptedKeys = await CryptoUtils_Legacy.decrypt(keys, pinCode, salt)
        } else {
            decryptedKeys = await CryptoUtils.decrypt(keys, pinCode, salt, iv)
        }
        return !!decryptedKeys && !!decryptedKeys.redux
    } catch (e) {
        error(ERROR_EVENTS.SECURITY, e)
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
