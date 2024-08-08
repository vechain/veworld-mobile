import { StorageEncryptionKeys, WalletEncryptionKey } from "~Components/Providers/EncryptedStorageProvider/Model"
import { Keychain } from "~Storage"
import { CryptoUtils, debug, error, PasswordUtils } from "~Utils"
import { StorageEncryptionKeyHelper, WalletEncryptionKeyHelper } from "~Components"
import SaltHelper from "./SaltHelper"
import { ERROR_EVENTS } from "~Constants"

const BACKUP_KEY_STORAGE = "BACKUP_KEY_STORAGE"

// TODO.vas - fix entire file

type BackupKeys = {
    wallet: WalletEncryptionKey
    storage: StorageEncryptionKeys
}

const _store = async (keys: BackupKeys, pinCode: string) => {
    const { salt, iv: base64IV } = await SaltHelper.getSaltAndIV()
    const iv = PasswordUtils.base64ToBuffer(base64IV)
    const encryptedKeys = await CryptoUtils.encrypt(keys, pinCode, salt, iv)

    await Keychain.set({
        key: BACKUP_KEY_STORAGE,
        value: encryptedKeys,
    })
}

const get = async (pinCode: string): Promise<BackupKeys | null> => {
    const keys = await Keychain.get({
        key: BACKUP_KEY_STORAGE,
    })

    if (!keys) {
        debug(ERROR_EVENTS.SECURITY, "Backup: No keys found")
        return null
    }

    const { salt, iv: base64IV } = await SaltHelper.getSaltAndIV()
    const iv = PasswordUtils.base64ToBuffer(base64IV)
    const backupKeys: BackupKeys = await CryptoUtils.decrypt(keys, pinCode, salt, iv)
    return backupKeys
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
            throw new Error("No backup keys found - CRITICAL: Security upgrade failed, no backup keys found")
        }
        await WalletEncryptionKeyHelper.set(keys.wallet, oldPin)
        await StorageEncryptionKeyHelper.set(keys.storage, oldPin)
        await clear()
    } catch (e) {
        error(ERROR_EVENTS.SECURITY, "CRITICAL: Security upgrade failed", e, { oldPin })
        throw e
    }
}

/**
 * Update the security method
 * @param currentPinCode
 * @param newPinCode
 */
const updateSecurityMethod = async (currentPinCode: string, newPinCode?: string): Promise<boolean> => {
    let wallet
    let storage

    try {
        wallet = await WalletEncryptionKeyHelper.get(currentPinCode)
        storage = await StorageEncryptionKeyHelper.get(currentPinCode)

        const backup: BackupKeys = {
            wallet,
            storage,
        }

        await _store(backup, currentPinCode)
    } catch (e) {
        error(ERROR_EVENTS.SECURITY, "Failed to back up current keys", e)
        return false
    }

    try {
        await WalletEncryptionKeyHelper.remove()
        await WalletEncryptionKeyHelper.set(wallet, newPinCode)

        await StorageEncryptionKeyHelper.remove()
        await StorageEncryptionKeyHelper.set(storage, newPinCode)

        await clear()

        return true
    } catch (e) {
        error(ERROR_EVENTS.SECURITY, "Failed to update security method", e)
        await handleSecurityUpgradeFailure(currentPinCode)
        return false
    }
}
export default {
    get,
    clear,
    updateSecurityMethod,
}
