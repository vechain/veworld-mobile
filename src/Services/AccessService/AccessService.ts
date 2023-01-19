import { debug, error, veWorldErrors } from "~Common"
import { EncryptionKey, WALLET_STATUS } from "~Model"
import AccountService from "~Services/AccountService"
import ActivityService from "~Services/ActivityService"
import BalanceService from "~Services/BalanceService"
import ConnectedAppService from "~Services/ConnectedAppService"
import DeviceService from "~Services/DeviceService"
import EncryptionKeyService from "~Services/EncryptionKeyService"
import LocalWalletService from "~Services/LocalWalletService"
import SettingService from "~Services/SettingService/SettingService"
import TokenService from "~Services/TokenService"
import { AppThunk, clearEntireCache, updateWalletStatus } from "~Storage/Caches"

/**
 * Locks VeWorld
 *  - All stores will be locked
 *  - The VeWorld cache will be wiped
 *  - The cached encryption key will be removed from the service worker (if the flag is set or not provided)
 * @returns
 */
const lock = (): AppThunk<void> => async dispatch => {
    try {
        debug("Locking VeWorld")

        // Lock all stores
        AccountService.lock()
        ActivityService.lock()
        BalanceService.lock()
        TokenService.lock()
        ConnectedAppService.lock()
        SettingService.lock()
        DeviceService.lock()
        LocalWalletService.lock()
        EncryptionKeyService.lock()

        // Clear the wallet cache
        dispatch(clearEntireCache())
    } catch (e) {
        error(e)
        throw veWorldErrors.rpc.internal({
            error: e,
            message: "Failed to lock VeWorld",
        })
    }
}

/**
 * Unlocks VeWorld
 *  - A backup will be performed if there is a backup present
 *  - All stores will be unlocked (depending on the wallet mode)
 *  - All caches will be initialised from the stored data
 *  - The cached encryption key will be set in the service worker
 *  - The available tokens cache will be updated from Github (asynchronously)
 *  - Balances will be updated (asynchronously)
 * @param encryptionKey
 * @returns
 */
const unlock =
    (encryptionKey: EncryptionKey): AppThunk<Promise<void>> =>
    async dispatch => {
        debug("Unlocking VeWorld")

        try {
            // Check if a recovery is required. If there is data in the backupStore then restore it.
            // TODO: Do we need backup service? Why isn't it ported from the extension?
            // if (await BackupService.exists()) {
            //     await BackupService.restore()
            //     await BackupService.reset()
            // }

            // Unlock all of the stores
            AccountService.unlock(encryptionKey.generatedKey)
            ActivityService.unlock(encryptionKey.generatedKey)
            BalanceService.unlock(encryptionKey.generatedKey)
            TokenService.unlock(encryptionKey.generatedKey)
            ConnectedAppService.unlock(encryptionKey.generatedKey)
            SettingService.unlock(encryptionKey.generatedKey)
            DeviceService.unlock(encryptionKey.generatedKey)
            if (encryptionKey.userKey) {
                LocalWalletService.unlock(encryptionKey.userKey)
                EncryptionKeyService.unlock(encryptionKey.userKey)
            }

            // Initialise the caches
            await dispatch(SettingService.initialiseCache())
            await dispatch(AccountService.initialiseCache())
            await dispatch(ActivityService.initialiseCache())
            await dispatch(DeviceService.initialiseCache())
            await dispatch(ConnectedAppService.initialiseCache())
            await dispatch(TokenService.initialiseCache())
            await dispatch(BalanceService.initialiseCache())

            // Set the wallet state to `UNLOCKED` once everything is initialised
            dispatch(updateWalletStatus(WALLET_STATUS.UNLOCKED))
        } catch (e) {
            error(e)
            throw veWorldErrors.rpc.internal({
                error: e,
                message: "Failed to unlock VeWorld",
            })
        }
    }

export default {
    lock,
    unlock,
}
