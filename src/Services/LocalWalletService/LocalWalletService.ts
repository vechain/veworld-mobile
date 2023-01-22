import { mnemonic, HDNode } from "thor-devkit"
import { AsyncStoreType, CryptoUtils, HexUtils, error } from "~Common"
import { DEVICE_TYPE, Device, Wallet } from "~Model"
import { setMnemonic, purgeWalletState, AppThunk } from "~Storage/Caches"
import { AsyncStore, KeychainStore } from "~Storage/Stores"

export const generateMnemonicPhrase = (): string[] => mnemonic.generate()

/**
 * Create a wallet and a device from mnemonic
 * @typedef AppThunk
 * @description Creates a Wallet and a Device and saves them on Keychain and AsyncStore respectively. Cleans up wallet cache.
 * @param alias
 * @param mnemonicPhrase
 * @optional encryptionKey
 * @returns Void
 */
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

            let deviceIndex = await getDeviceIndex()
            const device: Device = {
                alias: `${alias} ${deviceIndex}`,
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
                // encrypt wallet first - then
                // await KeychainStore.set<Wallet>(
                //     wallet.rootAddress,
                //     wallet,
                //     false,
                // )
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
    async dispatch => {
        try {
            let devices = await AsyncStore.getFor<Device[]>(
                AsyncStoreType.Devices,
            )

            if (devices) {
                devices.push(device)
                await AsyncStore.set<Device[]>(devices, AsyncStoreType.Devices)
                await updateDeviceIndex()
                dispatch(purgeWalletState())
                return
            }

            await AsyncStore.set<Device[]>([device], AsyncStoreType.Devices)
            await updateDeviceIndex()
            dispatch(purgeWalletState())

            // set device to redux
        } catch (e) {
            error(e)
        }
    }

const updateDeviceIndex = async () => {
    let lastIndex = await AsyncStore.getFor<string>(AsyncStoreType.DeviceIndex)
    if (lastIndex) {
        let newIndex = parseInt(lastIndex, 10)
        await AsyncStore.set<string>(
            JSON.stringify(newIndex + 1),
            AsyncStoreType.DeviceIndex,
        )
        return
    }
    await AsyncStore.set<string>("1", AsyncStoreType.DeviceIndex)
}

const getDeviceIndex = async () => {
    let lastIndex = await AsyncStore.getFor<string>(AsyncStoreType.DeviceIndex)
    if (lastIndex) {
        let newIndex = parseInt(lastIndex, 10)
        return newIndex + 1
    }
    return 1
}

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
