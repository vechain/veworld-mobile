// import { debug, error, veWorldErrors, warn } from "~Common"
// import { Settings, WALLET_STATUS } from "~Model"
// import SettingService from "../SettingService"
// import { AppThunk, updateWalletStatus } from "~Storage/Caches"
// import EncryptionKeyService from "~Services/EncryptionKeyService"
// import LocalWalletService from "~Services/LocalWalletService"
// import ActivityService from "~Services/ActivityService"
// import ConnectedAppService from "~Services/ConnectedAppService"
// import TokenService from "~Services/TokenService"
// import BalanceService from "~Services/BalanceService"
// import DeviceService from "~Services/DeviceService"
// import AccountService from "~Services/AccountService"

// export const toggleConfirmTx =
//     (): AppThunk<Promise<void>> => async dispatch => {
//         debug("Toggling confirm transaction")

//         const confirmTxUpdate = (settings: Settings) =>
//             (settings.advanced.skipTxConfirm = !settings.advanced.skipTxConfirm)

//         await dispatch(SettingService.update(confirmTxUpdate))
//     }

// export const resetVeWorld =
//     (userKey: string): AppThunk<Promise<void>> =>
//     async dispatch => {
//         warn("Resetting VeWorld")

//         try {
//             // Verify the user's key before resetting
//             if (
//                 (await EncryptionKeyService.exists()) &&
//                 !(await EncryptionKeyService.checkEncryptionKey(userKey))
//             ) {
//                 throw veWorldErrors.provider.unauthorized({
//                     message: "Invalid password",
//                 })
//             }

//             // Reset all wallet data
//             await LocalWalletService.reset()
//             // TODO: ??
//             // await BackupService.reset()
//             await EncryptionKeyService.reset()
//             await dispatch(SettingService.reset())
//             await dispatch(ActivityService.reset())
//             await dispatch(ConnectedAppService.reset())
//             await dispatch(TokenService.reset())
//             await dispatch(BalanceService.reset())
//             await dispatch(DeviceService.reset())
//             await dispatch(AccountService.reset())

//             // Finally, update the wallet cache
//             dispatch(updateWalletStatus(WALLET_STATUS.FIRST_TIME_ACCESS))

//             warn("VeWorld reset")
//         } catch (e) {
//             error(e)
//             throw veWorldErrors.rpc.internal({
//                 error: e,
//                 message: "Failed to reset VeWorld",
//             })
//         }
//     }
