// import { address, HDNode, mnemonic } from "thor-devkit"
// import {
//     AddressUtils,
//     CryptoUtils,
//     HexUtils,
//     debug,
//     error,
//     info,
//     veWorldErrors,
//     warn,
// } from "~Common"
// import {
//     DEVICE_TYPE,
//     Device,
//     WALLET_MODE,
//     Wallet,
//     WalletStorageData,
// } from "~Model"
// import { LocalWalletStore } from "~Storage/Stores"
// import DeviceService from "~Services/DeviceService"
// import AccountService from "~Services/AccountService"

import { mnemonic, HDNode } from "thor-devkit"
import { AsyncStoreType, CryptoUtils, HexUtils, error } from "~Common"
import { DEVICE_TYPE, Device, Wallet } from "~Model"
import { setMnemonic, purgeWalletState, AppThunk } from "~Storage/Caches"
import { AsyncStore, KeychainStore } from "~Storage/Stores"

export const generateMnemonicPhrase = (): string[] => mnemonic.generate()

const createMnemonicWallet =
    (
        alias: string,
        mnemonicPhrase: string[],
        encryptionKey?: string,
    ): AppThunk<void> =>
    async (dispatch, _) => {
        try {
            if (mnemonicPhrase.length !== 12) {
                error("mnemonicPhrase.length !== 12")
                return
            }

            const hdNode = HDNode.fromMnemonic(mnemonicPhrase)

            const wallet: Wallet = {
                mnemonic: mnemonicPhrase,
                nonce: HexUtils.generateRandom(256),
                rootAddress: hdNode.address,
            }

            const device: Device = {
                alias: alias,
                xPub: CryptoUtils.xPubFromHdNode(hdNode),
                rootAddress: hdNode.address,
                type: DEVICE_TYPE.LOCAL_MNEMONIC,
            }

            dispatch(backupWallet(wallet, encryptionKey))
            dispatch(backupDevice(device))
        } catch (e) {
            error(e)
        }
    }

const backupWallet =
    (wallet: Wallet, encryptionKey?: string): AppThunk<void> =>
    async () => {
        try {
            if (encryptionKey) {
            } else {
                await KeychainStore.set<Wallet>(
                    wallet.rootAddress,
                    wallet,
                    true,
                )
            }
        } catch (e) {
            error(e)
        }
    }

const backupDevice =
    (device: Device): AppThunk<void> =>
    async () => {
        try {
            let devices = await AsyncStore.getFor<Device[]>(
                AsyncStoreType.Devices,
            )

            if (devices) {
                devices.push(device)
                await AsyncStore.set<Device[]>(devices, AsyncStoreType.Devices)
                return
            }

            await AsyncStore.set<Device[]>([device], AsyncStoreType.Devices)

            // set device to redux
        } catch (e) {
            error(e)
        }
    }

// const get = async () => await LocalWalletStore.get()

// const lock = () => LocalWalletStore.lock()

// const unlock = (key: string) => LocalWalletStore.unlock(key)

// export const exists = async (): Promise<boolean> =>
//     await LocalWalletStore.exists()

// /**
//  * Reset the wallet store
//  * The store must be unlocked
//  */
// const reset = async () => await LocalWalletStore.clear()

// /**
//  * Update the wallet store
//  * The store must be unlocked
//  * @param walletUpdate - The update to apply to the wallets
//  * @param mode - the wallet mode
//  * @param encryptionKey - the optional key to unlock the wallet store
//  */
// const update = async (
//     walletUpdate: (wallets: WalletStorageData) => void,
//     mode: WALLET_MODE,
//     encryptionKey?: string,
// ) => {
//     debug("Updating a local wallet")

//     try {
//         if (mode === WALLET_MODE.ASK_TO_SIGN && encryptionKey)
//             LocalWalletStore.unlock(encryptionKey)

//         //Update the wallets
//         await LocalWalletStore.update([walletUpdate])
//     } catch (e) {
//         error(e)
//         throw veWorldErrors.rpc.internal({
//             error: e,
//             message: "Failed to update wallets",
//         })
//     } finally {
//         if (mode === WALLET_MODE.ASK_TO_SIGN) LocalWalletStore.lock()
//     }
// }

// const add = async (
//     wallet: Wallet,
//     mode: WALLET_MODE,
//     encryptionKey?: string,
// ) => {
//     try {
//         const existing = await exists()

//         if (!existing) {
//             return await LocalWalletStore.insert({ wallets: [wallet] })
//         }

//         const walletUpdate = (storage: WalletStorageData) => {
//             if (
//                 storage.wallets.some(wall =>
//                     AddressUtils.compareAddresses(
//                         wall.rootAddress,
//                         wallet.rootAddress,
//                     ),
//                 )
//             ) {
//                 throw veWorldErrors.rpc.invalidRequest({
//                     message: "wallet_already_exists",
//                 })
//             }

//             storage.wallets.push(wallet)
//         }

//         await update(walletUpdate, mode, encryptionKey)
//     } catch (e) {
//         error(e)
//         throw veWorldErrors.rpc.internal({
//             error: e,
//             message: "failed_to_add_wallet",
//         })
//     }
// }

// const remove =
//     (
//         addr: string,
//         mode: WALLET_MODE,
//         encryptionKey: string,
//     ): AppThunk<Promise<void>> =>
//     async dispatch => {
//         warn("Removing a local wallet")

//         try {
//             const passwordValidated = await checkEncryptionKey(encryptionKey)

//             if (!passwordValidated)
//                 throw veWorldErrors.provider.unauthorized({
//                     message: "User must authenticate in order to remove device",
//                 })

//             const walletUpdate = (storage: WalletStorageData) => {
//                 const index = storage.wallets.findIndex(
//                     wall => wall.rootAddress === addr,
//                 )

//                 if (index >= 0) {
//                     storage.wallets.splice(index, 1)
//                 }
//             }

//             await update(walletUpdate, mode, encryptionKey)

//             await dispatch(DeviceService.remove(addr))
//         } catch (e) {
//             error(e)
//             throw veWorldErrors.rpc.internal({
//                 error: e,
//                 message: "Failed to remove wallets",
//             })
//         } finally {
//             if (mode === WALLET_MODE.ASK_TO_SIGN) LocalWalletStore.lock()
//         }
//     }

// /**
//  * Checks if the encryptionKey can decrypt the wallet store
//  * @param encryptionKey - the key to check
//  */
// const checkEncryptionKey = async (encryptionKey: string): Promise<boolean> =>
//     await LocalWalletStore.checkEncryptionKey(encryptionKey)

// const changeEncryptionKey = (newKey: string) =>
//     LocalWalletStore.changeEncryptionKey(newKey)

export default {
    // checkEncryptionKey,
    // changeEncryptionKey,
    // backupMnemonic,
    backupWallet,
    backupDevice,
    generateMnemonicPhrase,
    setMnemonic,
    purgeWalletState,
    createMnemonicWallet,
    // addPrivateKeyWallet,
    // lock,
    // unlock,
    // reset,
    // exists,
    // remove,
    // get,
}
