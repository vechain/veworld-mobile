import Web3 from "web3"
import { address, HDNode, mnemonic } from "thor-devkit"
import { AppThunk, getWalletMode } from "~Storage/Caches"
import {
    AddressUtils,
    CryptoUtils,
    HexUtils,
    debug,
    error,
    info,
    veWorldErrors,
    warn,
} from "~Common"
import {
    DEVICE_TYPE,
    Device,
    WALLET_MODE,
    Wallet,
    WalletStorageData,
} from "~Model"
import { LocalWalletStore } from "~Storage/Stores"
import DeviceService from "~Services/DeviceService"
import AccountService from "~Services/AccountService"

const web3 = new Web3()

const generateMnemonicPhrase = (): string[] => mnemonic.generate()

const addPrivateKeyWallet =
    (
        alias: string,
        privateKey: string,
        encryptionKey?: string,
    ): AppThunk<Promise<string>> =>
    async (dispatch, getState) => {
        info("Adding a new private key local wallet")

        const mode = getWalletMode(getState())

        try {
            // If the wallet mode is ASK_TO_SIGN then we need to unlock the wallet
            if (mode === WALLET_MODE.ASK_TO_SIGN) {
                if (!encryptionKey)
                    throw veWorldErrors.provider.unauthorized({
                        message: "failed_to_get_password",
                    })
                LocalWalletStore.unlock(encryptionKey)
            }

            const acc = web3.eth.accounts.privateKeyToAccount(privateKey)

            const addr = address.toChecksumed(acc.address)

            const wallet: Wallet = {
                privateKey: privateKey,
                nonce: HexUtils.generateRandom(256),
                rootAddress: addr,
            }

            const device: Device = {
                alias: alias,
                rootAddress: addr,
                type: DEVICE_TYPE.LOCAL_PRIVATE_KEY,
            }

            // Add Device
            await dispatch(DeviceService.add(device))

            // Add accounts
            await dispatch(AccountService.addForNewDevice(device))

            // Persist the wallet - Do this last in case of failure
            await add(wallet, mode, encryptionKey)

            return device.rootAddress
        } catch (e) {
            error(e)
            throw veWorldErrors.rpc.internal({
                error: e,
                message: "failed_to_add_wallet",
            })
        } finally {
            if (mode === WALLET_MODE.ASK_TO_SIGN) LocalWalletStore.lock()
        }
    }

const addMnemonicWallet =
    (
        alias: string,
        mnemonicPhrase: string[],
        encryptionKey?: string,
    ): AppThunk<Promise<string>> =>
    async (dispatch, getState) => {
        info("Adding a new mnemonic phrase local wallet")

        const mode = getWalletMode(getState())

        try {
            if (mnemonicPhrase.length !== 12)
                throw veWorldErrors.rpc.invalidRequest({
                    message: "wrong_mnemonic_length",
                })

            // If the wallet mode is ASK_TO_SIGN then we need to unlock the wallet
            if (mode === WALLET_MODE.ASK_TO_SIGN) {
                if (!encryptionKey)
                    throw veWorldErrors.provider.unauthorized({
                        message: "failed_to_get_password",
                    })
                LocalWalletStore.unlock(encryptionKey)
            }

            // Add new wallet as a device
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

            // Add the device
            await dispatch(DeviceService.add(device))

            // Add accounts
            await dispatch(AccountService.addForNewDevice(device))

            // Persist the wallet - Do this last in case of failure
            await add(wallet, mode, encryptionKey)

            return device.rootAddress
        } catch (e) {
            error(e)
            throw veWorldErrors.rpc.internal({
                error: e,
                message: "failed_to_import_mnemonic",
            })
        } finally {
            if (mode === WALLET_MODE.ASK_TO_SIGN) LocalWalletStore.lock()
        }
    }

const backupMnemonic =
    (
        rootAddress: string,
        encryptionKey?: string,
    ): AppThunk<Promise<string[]>> =>
    async (_, getState) => {
        warn("Backing up mnemonic")

        const mode = getWalletMode(getState())

        let mnemon
        const releaseLock = await LocalWalletStore.acquireMutex()
        try {
            if (mode === WALLET_MODE.ASK_TO_SIGN && encryptionKey)
                LocalWalletStore.unlock(encryptionKey)

            // Get the wallet
            const storage = await LocalWalletStore.get()

            const wallet = storage.wallets.find(_wallet =>
                AddressUtils.compareAddresses(_wallet.rootAddress, rootAddress),
            )
            if (!wallet || !wallet.mnemonic) {
                throw veWorldErrors.rpc.resourceNotFound({
                    message: `No HD wallet found with root address ${rootAddress}`,
                })
            }

            mnemon = wallet.mnemonic
        } catch (e) {
            error(e)
            throw veWorldErrors.rpc.internal({
                error: e,
                message: "failed_to_get_mnemonic",
            })
        } finally {
            if (mode === WALLET_MODE.ASK_TO_SIGN) LocalWalletStore.lock()
            releaseLock()
        }
        return mnemon
    }

const get = async () => await LocalWalletStore.get()

const lock = () => LocalWalletStore.lock()

const unlock = (key: string) => LocalWalletStore.unlock(key)

export const exists = async (): Promise<boolean> =>
    await LocalWalletStore.exists()

/**
 * Reset the wallet store
 * The store must be unlocked
 */
const reset = async () => await LocalWalletStore.clear()

/**
 * Update the wallet store
 * The store must be unlocked
 * @param walletUpdate - The update to apply to the wallets
 * @param mode - the wallet mode
 * @param encryptionKey - the optional key to unlock the wallet store
 */
const update = async (
    walletUpdate: (wallets: WalletStorageData) => void,
    mode: WALLET_MODE,
    encryptionKey?: string,
) => {
    debug("Updating a local wallet")

    try {
        if (mode === WALLET_MODE.ASK_TO_SIGN && encryptionKey)
            LocalWalletStore.unlock(encryptionKey)

        //Update the wallets
        await LocalWalletStore.update([walletUpdate])
    } catch (e) {
        error(e)
        throw veWorldErrors.rpc.internal({
            error: e,
            message: "Failed to update wallets",
        })
    } finally {
        if (mode === WALLET_MODE.ASK_TO_SIGN) LocalWalletStore.lock()
    }
}

const add = async (
    wallet: Wallet,
    mode: WALLET_MODE,
    encryptionKey?: string,
) => {
    try {
        const existing = await exists()

        if (!existing) {
            return await LocalWalletStore.insert({ wallets: [wallet] })
        }

        const walletUpdate = (storage: WalletStorageData) => {
            if (
                storage.wallets.some(wall =>
                    AddressUtils.compareAddresses(
                        wall.rootAddress,
                        wallet.rootAddress,
                    ),
                )
            ) {
                throw veWorldErrors.rpc.invalidRequest({
                    message: "wallet_already_exists",
                })
            }

            storage.wallets.push(wallet)
        }

        await update(walletUpdate, mode, encryptionKey)
    } catch (e) {
        error(e)
        throw veWorldErrors.rpc.internal({
            error: e,
            message: "failed_to_add_wallet",
        })
    }
}

const remove =
    (
        addr: string,
        mode: WALLET_MODE,
        encryptionKey: string,
    ): AppThunk<Promise<void>> =>
    async dispatch => {
        warn("Removing a local wallet")

        try {
            const passwordValidated = await checkEncryptionKey(encryptionKey)

            if (!passwordValidated)
                throw veWorldErrors.provider.unauthorized({
                    message: "User must authenticate in order to remove device",
                })

            const walletUpdate = (storage: WalletStorageData) => {
                const index = storage.wallets.findIndex(
                    wall => wall.rootAddress === addr,
                )

                if (index >= 0) {
                    storage.wallets.splice(index, 1)
                }
            }

            await update(walletUpdate, mode, encryptionKey)

            await dispatch(DeviceService.remove(addr))
        } catch (e) {
            error(e)
            throw veWorldErrors.rpc.internal({
                error: e,
                message: "Failed to remove wallets",
            })
        } finally {
            if (mode === WALLET_MODE.ASK_TO_SIGN) LocalWalletStore.lock()
        }
    }

/**
 * Checks if the encryptionKey can decrypt the wallet store
 * @param encryptionKey - the key to check
 */
const checkEncryptionKey = async (encryptionKey: string): Promise<boolean> =>
    await LocalWalletStore.checkEncryptionKey(encryptionKey)

const changeEncryptionKey = (newKey: string) =>
    LocalWalletStore.changeEncryptionKey(newKey)

export default {
    checkEncryptionKey,
    changeEncryptionKey,
    backupMnemonic,
    generateMnemonicPhrase,
    addMnemonicWallet,
    addPrivateKeyWallet,
    lock,
    unlock,
    reset,
    exists,
    remove,
    get,
}
