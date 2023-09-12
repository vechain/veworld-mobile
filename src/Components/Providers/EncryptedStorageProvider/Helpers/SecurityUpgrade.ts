import { EncryptionKeys } from "~Components/Providers/EncryptedStorageProvider/Model"
import { SecureStoreOptions } from "expo-secure-store/src/SecureStore"
import { Keychain } from "~Storage"
import { CryptoUtils, debug, error } from "~Utils"
import EncryptionKeyHelper from "~Components/Providers/EncryptedStorageProvider/Helpers/EncryptionKeyHelper"

const BACKUP_KEY_STORAGE = "BACKUP_KEY_STORAGE"

const _store = async (keys: EncryptionKeys, pinCode: string) => {
    const encryptedKeys = CryptoUtils.encrypt(keys, pinCode)

    const options: SecureStoreOptions = {
        requireAuthentication: false,
    }

    await Keychain.set({
        key: BACKUP_KEY_STORAGE,
        options,
        value: encryptedKeys,
    })
}

const get = async (pinCode: string): Promise<EncryptionKeys | null> => {
    const keys = await Keychain.get({
        key: BACKUP_KEY_STORAGE,
        options: {
            requireAuthentication: true,
        },
    })

    if (!keys) {
        debug("Backup: No keys found")
        return null
    }

    return CryptoUtils.decrypt(keys, pinCode) as EncryptionKeys
}

const clear = async () => {
    await Keychain.deleteItem({ key: BACKUP_KEY_STORAGE })
}

/**
 * Restore the old keys if the security upgrade fails
 * @param oldPin
 */
const handleSecurityUpgradeFailure = async (oldPin: string) => {
    try {
        const keys = await get(oldPin)

        if (!keys) {
            error("CRITICAL: Security upgrade failed, no backup keys found")
            throw new Error("No backup keys found")
        }
        await EncryptionKeyHelper.set(keys, oldPin)
        await clear()
    } catch (e) {
        error("CRITICAL: Security upgrade failed", e)
        throw e
    }
}

/**
 * Update the security method
 * @param currentPinCode
 * @param newPinCode
 */
const updateSecurityMethod = async (
    currentPinCode: string,
    newPinCode?: string,
): Promise<boolean> => {
    const keys = await EncryptionKeyHelper.get(currentPinCode)

    await _store(keys, currentPinCode)

    try {
        await EncryptionKeyHelper.remove()
        await EncryptionKeyHelper.set(keys, newPinCode)

        await clear()

        return true
    } catch (e) {
        error("Failed to update security method", e)
        await handleSecurityUpgradeFailure(currentPinCode)
        return false
    }
}
export default {
    get,
    clear,
    updateSecurityMethod,
}
