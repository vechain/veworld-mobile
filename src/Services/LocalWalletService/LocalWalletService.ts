import { mnemonic, HDNode } from "thor-devkit"
import { AsyncStoreType, CryptoUtils, HexUtils, error } from "~Common"
import { DEVICE_TYPE, Device, Wallet } from "~Model"
import DeviceService from "~Services/DeviceService"
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
            dispatch(DeviceService.backupDevice(device))
        } catch (e) {
            error(e)
        }
    }

const backupWallet =
    (wallet: Wallet, encryptionKey?: string): AppThunk<void> =>
    async dispatch => {
        try {
            if (encryptionKey) {
                const encryptedWallet = CryptoUtils.encrypt(
                    wallet,
                    encryptionKey,
                )

                await KeychainStore.set<string>(
                    wallet.rootAddress,
                    encryptedWallet,
                    false,
                )
                dispatch(purgeWalletState())
                return
            }

            await KeychainStore.set<Wallet>(wallet.rootAddress, wallet, true)
            dispatch(purgeWalletState())
        } catch (e) {
            error(e)
        }
    }

const getDeviceIndex = async () => {
    let lastIndex = await AsyncStore.getFor<string>(AsyncStoreType.DeviceIndex)
    if (lastIndex) {
        let newIndex = parseInt(lastIndex, 10)
        return newIndex + 1
    }
    return 1
}

export const getWalletFor = async (
    deviceAddress: string,
    encryptionKey?: string,
) => {
    let wallet: Wallet

    try {
        if (encryptionKey) {
            let encryptedWallet = await KeychainStore.get(deviceAddress, false)
            if (encryptedWallet) {
                let _wallet = CryptoUtils.decrypt(
                    encryptedWallet.password,
                    encryptionKey,
                )

                wallet = JSON.parse(_wallet)
            }
        } else {
            let encryptedWallet = await KeychainStore.get(deviceAddress, true)
            if (encryptedWallet) {
                wallet = JSON.parse(encryptedWallet.password)
            }
        }
    } catch (e) {
        error(e)
    }

    return wallet!
}

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

export default {
    // checkEncryptionKey,
    // changeEncryptionKey,
    // backupMnemonic,
    generateMnemonicPhrase,
    setMnemonic,
    purgeWalletState,
    createMnemonicWallet,
    getWalletFor,
    // addPrivateKeyWallet,
    // lock,
    // unlock,
    // reset,
    // exists,
    // remove,
    // get,
}
