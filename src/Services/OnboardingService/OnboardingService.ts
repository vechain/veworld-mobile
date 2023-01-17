import { veWorldErrors } from "~Common/Errors"
import HexUtils from "~Common/Utils/HexUtils"
import { AppThunk } from "~Storage/Caches/cache"
import { EncryptionKey } from "~Model/EncryptionKey"
import { WALLET_MODE } from "~Model/Wallet/enums"
import { getDefaultSettings } from "~Common/constants/Settings/SettingsConstants"
import AccountService from "../AccountService"
import ActivityService from "../ActivityService"
import BalanceService from "../BalanceService"
import ConnectedAppService from "../ConnectedAppService"
import DeviceService from "../DeviceService"
import EncryptionKeyService from "../EncryptionKeyService"
import LocalWalletService from "../LocalWalletService"
import SettingService from "../SettingService"
import TokenService from "../TokenService"
import { info, error } from "~Common/Logger/Logger"

/**
 * Initialises a new VeWorld wallet. This should only be called once during the onboarding process.
 *
 * @param userKey - the user's passphrase
 */
const initialiseNewWallet =
    (userKey: string): AppThunk<Promise<void>> =>
    async dispatch => {
        info("Initialising VeWorld")

        try {
            const exists = await EncryptionKeyService.exists()

            const defaultSettings = getDefaultSettings()

            if (exists)
                throw veWorldErrors.rpc.invalidRequest({
                    message:
                        "Failed to initialise VeWorld as it appears to have already been initialised",
                })

            // Generate an encryption key and include the user's key if the wallet mode is `UNLOCKED`
            const encryptionKey: EncryptionKey = {
                generatedKey: HexUtils.generateRandom(256),
                userKey:
                    defaultSettings.securityAndPrivacy.localWalletMode ===
                    WALLET_MODE.UNLOCKED
                        ? userKey
                        : undefined,
            }

            // Unlock all of the stores
            AccountService.unlock(encryptionKey.generatedKey)
            ActivityService.unlock(encryptionKey.generatedKey)
            TokenService.unlock(encryptionKey.generatedKey)
            BalanceService.unlock(encryptionKey.generatedKey)
            ConnectedAppService.unlock(encryptionKey.generatedKey)
            SettingService.unlock(encryptionKey.generatedKey)
            DeviceService.unlock(encryptionKey.generatedKey)
            LocalWalletService.unlock(userKey)
            EncryptionKeyService.unlock(userKey)

            // Reset all wallet data
            await dispatch(SettingService.Advanced.resetVeWorld(userKey))

            // Update the encryption key
            await EncryptionKeyService.update(encryptionKey)

            // If in `ASK_TO_SIGN` mode lock the wallet and key stores
            if (
                defaultSettings.securityAndPrivacy.localWalletMode ===
                WALLET_MODE.ASK_TO_SIGN
            ) {
                EncryptionKeyService.lock()
                LocalWalletService.lock()
            }

            info("VeWorld Initialised")
        } catch (e) {
            error(e)
            throw veWorldErrors.rpc.internal({
                error: e,
                message: "Failed to initialise VeWorld",
            })
        }
    }

export default {
    initialiseNewWallet,
}
