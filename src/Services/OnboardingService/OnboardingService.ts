// import {
//     HexUtils,
//     SettingsConstants,
//     error,
//     info,
//     veWorldErrors,
// } from "~Common"
// import { EncryptionKey, WALLET_MODE } from "~Model"
// import AccountService from "~Services/AccountService"
// import ActivityService from "~Services/ActivityService"
// import BalanceService from "~Services/BalanceService"
// import ConnectedAppService from "~Services/ConnectedAppService"
// import DeviceService from "~Services/DeviceService"
// import EncryptionKeyService from "~Services/EncryptionKeyService"
// import LocalWalletService from "~Services/LocalWalletService"
// import SettingService from "~Services/SettingService"
// import TokenService from "~Services/TokenService"
// import { AppThunk } from "~Storage/Caches"

// /**
//  * Initialises a new VeWorld wallet. This should only be called once during the onboarding process.
//  *
//  * @param userKey - the user's passphrase
//  */
// const initialiseNewWallet =
//     (userKey: string): AppThunk<Promise<void>> =>
//     async dispatch => {
//         info("Initialising VeWorld")

//         try {
//             const exists = await EncryptionKeyService.exists()

//             const defaultSettings = SettingsConstants.getDefaultSettings()

//             if (exists)
//                 throw veWorldErrors.rpc.invalidRequest({
//                     message:
//                         "Failed to initialise VeWorld as it appears to have already been initialised",
//                 })

//             // Generate an encryption key and include the user's key if the wallet mode is `UNLOCKED`
//             const encryptionKey: EncryptionKey = {
//                 generatedKey: HexUtils.generateRandom(256),
//                 userKey:
//                     defaultSettings.securityAndPrivacy.localWalletMode ===
//                     WALLET_MODE.UNLOCKED
//                         ? userKey
//                         : undefined,
//             }

//             // Unlock all of the stores
//             AccountService.unlock(encryptionKey.generatedKey)
//             ActivityService.unlock(encryptionKey.generatedKey)
//             TokenService.unlock(encryptionKey.generatedKey)
//             BalanceService.unlock(encryptionKey.generatedKey)
//             ConnectedAppService.unlock(encryptionKey.generatedKey)
//             SettingService.unlock(encryptionKey.generatedKey)
//             DeviceService.unlock(encryptionKey.generatedKey)
//             LocalWalletService.unlock(userKey)
//             EncryptionKeyService.unlock(userKey)

//             // Reset all wallet data
//             await dispatch(SettingService.Advanced.resetVeWorld(userKey))

//             // Update the encryption key
//             await EncryptionKeyService.update(encryptionKey)

//             // If in `ASK_TO_SIGN` mode lock the wallet and key stores
//             if (
//                 defaultSettings.securityAndPrivacy.localWalletMode ===
//                 WALLET_MODE.ASK_TO_SIGN
//             ) {
//                 EncryptionKeyService.lock()
//                 LocalWalletService.lock()
//             }

//             info("VeWorld Initialised")
//         } catch (e) {
//             error(e)
//             throw veWorldErrors.rpc.internal({
//                 error: e,
//                 message: "Failed to initialise VeWorld",
//             })
//         }
//     }

// export default {
//     initialiseNewWallet,
// }
