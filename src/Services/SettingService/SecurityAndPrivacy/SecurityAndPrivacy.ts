import { AppThunk } from "~Storage/Caches/cache"
import { AutoLockTime, Settings } from "~Model/Settings"
import SettingService from "../index"
import EncryptionKeyService from "../../EncryptionKeyService"
import { veWorldErrors } from "~Common/Errors"
import LocalWalletService from "../../LocalWalletService"
import { WALLET_MODE } from "~Model/Wallet/enums"
import AutoUnlockKeyService from "~Common/services/AutoUnlockKeyService"
import { debug, info, warn, error } from "~Common/Logger/Logger"

export const toggleShowIncomingTransactions =
    (): AppThunk<Promise<void>> => async dispatch => {
        debug("Toggle show incoming transactions")

        const customNodeUpdate = (settings: Settings) =>
            (settings.securityAndPrivacy.showIncomingTxs =
                !settings.securityAndPrivacy.showIncomingTxs)

        await dispatch(SettingService.update(customNodeUpdate))
    }

export const toggleAnalyticsTracking =
    (): AppThunk<Promise<void>> => async dispatch => {
        debug("Toggle analytics")

        const customNodeUpdate = (settings: Settings) =>
            (settings.securityAndPrivacy.analyticsTracking =
                !settings.securityAndPrivacy.analyticsTracking)

        await dispatch(SettingService.update(customNodeUpdate))
    }

export const resetPassword = async (
    oldUserKey: string,
    newUserKey: string,
    walletMode: WALLET_MODE,
) => {
    warn("Resetting password")

    try {
        // Verify the user's key before resetting
        if (!(await LocalWalletService.checkEncryptionKey(oldUserKey))) {
            throw veWorldErrors.provider.unauthorized({
                message: "Invalid password",
            })
        }

        if (walletMode === WALLET_MODE.ASK_TO_SIGN) {
            LocalWalletService.unlock(oldUserKey)
            EncryptionKeyService.unlock(oldUserKey)
        }

        //Change the keys
        await LocalWalletService.changeEncryptionKey(newUserKey)
        await EncryptionKeyService.changeEncryptionKey(newUserKey)

        const encryptionKeys = await EncryptionKeyService.get()

        //If we're storing the user key, update it
        if (encryptionKeys.userKey) {
            encryptionKeys.userKey = newUserKey

            await EncryptionKeyService.update(encryptionKeys)

            // Update the encryption key in the cache
            await AutoUnlockKeyService.update(encryptionKeys)
        }
    } catch (e) {
        error(e)
        throw veWorldErrors.rpc.internal({
            error: e,
            message: "Failed to reset password",
        })
    } finally {
        if (walletMode === WALLET_MODE.ASK_TO_SIGN) {
            LocalWalletService.lock()
            EncryptionKeyService.lock()
        }
    }
}

export const changeModeToUnlocked =
    (userKey: string): AppThunk<Promise<void>> =>
    async dispatch => {
        warn("Changing wallet mode to UNLOCKED")

        try {
            // Unlock the encryption key and wallet stores
            EncryptionKeyService.unlock(userKey)
            LocalWalletService.unlock(userKey)

            // Get the current encryption key and add the user Key
            const encryptionKey = await EncryptionKeyService.get()
            encryptionKey.userKey = userKey
            await EncryptionKeyService.update(encryptionKey)

            // Update wallet with new key and mode
            await dispatch(updateLocalWalletMode(WALLET_MODE.UNLOCKED))

            // Update the key in the service worker
            await AutoUnlockKeyService.update(encryptionKey)
        } catch (e) {
            error(e)
            throw veWorldErrors.rpc.internal({
                error: e,
                message: "failed_to_change_sign_mode",
            })
        }
    }

export const changeModeToAskToSign =
    (): AppThunk<Promise<void>> => async dispatch => {
        info("Changing wallet model to ASK_TO_SIGN")
        try {
            // Remove user Key from the encryption key
            const encryptionKey = await EncryptionKeyService.get()
            delete encryptionKey.userKey
            await EncryptionKeyService.update(encryptionKey)

            // Update wallet with new key and mode
            await dispatch(updateLocalWalletMode(WALLET_MODE.ASK_TO_SIGN))

            // Update the key in the service worker
            await AutoUnlockKeyService.update(encryptionKey)

            // Lock the encryption key and local wallet stores
            EncryptionKeyService.lock()
            LocalWalletService.lock()
        } catch (e) {
            error(e)
            throw veWorldErrors.rpc.internal({
                error: e,
                message: "failed_to_change_sign_mode",
            })
        }
    }

export const updateLocalWalletMode =
    (mode: WALLET_MODE): AppThunk<Promise<void>> =>
    async dispatch => {
        debug("Updating wallet mode")

        const modeUpdate = (settings: Settings) =>
            (settings.securityAndPrivacy.localWalletMode = mode)

        await dispatch(SettingService.update(modeUpdate))
    }

export const updateAutoLockTimer =
    (lockTime: AutoLockTime): AppThunk<Promise<void>> =>
    async dispatch => {
        info("Updating auto lock time")

        const languageUpdate = (settings: Settings) =>
            (settings.securityAndPrivacy.autoLockTimer = lockTime)

        //So we can access this in the service worker without authentication
        const timeInSeconds = lockTime * 60
        chrome.storage.local.set({ ["lock_timer"]: timeInSeconds }, () => {
            debug("lock timer saved successfully")
        })

        return dispatch(SettingService.update(languageUpdate))
    }
