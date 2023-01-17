import { WALLET_STATUS } from "~Model/Wallet/enums"
import { AppThunk } from "~Storage/Caches/cache"
import SettingService from "../index"
import { Settings } from "~Model/Settings"
import EncryptionKeyService from "../../EncryptionKeyService"
import LocalWalletService from "../../LocalWalletService"
import { veWorldErrors } from "~Common/Errors"
import BackupService from "../../BackupService"
import ActivityService from "../../ActivityService"
import ConnectedAppService from "../../ConnectedAppService"
import TokenService from "../../TokenService"
import AccountService from "../../AccountService"
import DeviceService from "../../DeviceService"
import { updateWalletStatus } from "~Storage/Caches/WalletAccess"
import BalanceService from "../../BalanceService"
import { debug, warn, error } from "~Common/Logger/Logger"

export const toggleConfirmTx =
    (): AppThunk<Promise<void>> => async dispatch => {
        debug("Toggling confirm transaction")

        const confirmTxUpdate = (settings: Settings) =>
            (settings.advanced.skipTxConfirm = !settings.advanced.skipTxConfirm)

        await dispatch(SettingService.update(confirmTxUpdate))
    }

export const resetVeWorld =
    (userKey: string): AppThunk<Promise<void>> =>
    async dispatch => {
        warn("Resetting VeWorld")

        try {
            // Verify the user's key before resetting
            if (
                (await EncryptionKeyService.exists()) &&
                !(await EncryptionKeyService.checkEncryptionKey(userKey))
            ) {
                throw veWorldErrors.provider.unauthorized({
                    message: "Invalid password",
                })
            }

            // Reset all wallet data
            await LocalWalletService.reset()
            await BackupService.reset()
            await EncryptionKeyService.reset()
            await dispatch(SettingService.reset())
            await dispatch(ActivityService.reset())
            await dispatch(ConnectedAppService.reset())
            await dispatch(TokenService.reset())
            await dispatch(BalanceService.reset())
            await dispatch(DeviceService.reset())
            await dispatch(AccountService.reset())

            // Finally, update the wallet cache
            dispatch(updateWalletStatus(WALLET_STATUS.FIRST_TIME_ACCESS))

            warn("VeWorld reset")
        } catch (e) {
            error(e)
            throw veWorldErrors.rpc.internal({
                error: e,
                message: "Failed to reset VeWorld",
            })
        }
    }
