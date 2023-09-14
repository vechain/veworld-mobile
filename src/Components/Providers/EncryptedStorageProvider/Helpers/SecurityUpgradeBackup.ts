import {
    StorageEncryptionKeys,
    WalletEncryptionKey,
} from "~Components/Providers/EncryptedStorageProvider/Model"
import { Keychain } from "~Storage"
import { CryptoUtils, debug, error } from "~Utils"
import {
    StorageEncryptionKeyHelper,
    WalletEncryptionKeyHelper,
} from "~Components"
import SaltHelper from "./SaltHelper"

const BACKUP_KEY_STORAGE = "BACKUP_KEY_STORAGE"

type BackupKeys = {
    wallet: WalletEncryptionKey
    storage: StorageEncryptionKeys
}

const _store = async (keys: BackupKeys, pinCode: string) => {
    const salt = await SaltHelper.getSalt()
    const encryptedKeys = CryptoUtils.encrypt(keys, pinCode, salt)

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
        debug("Backup: No keys found")
        return null
    }

    const salt = await SaltHelper.getSalt()

    return CryptoUtils.decrypt(keys, pinCode, salt) as BackupKeys
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
        await WalletEncryptionKeyHelper.set(keys.wallet, oldPin)
        await StorageEncryptionKeyHelper.set(keys.storage, oldPin)
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
        error("Failed to back up current keys keys", e)
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
