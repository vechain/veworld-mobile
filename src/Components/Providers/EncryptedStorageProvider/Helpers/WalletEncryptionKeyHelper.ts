import { Wallet } from "~Model"
import { WalletEncryptionKey } from "~Components/Providers/EncryptedStorageProvider/Model"
import { CryptoUtils, CryptoUtils_Legacy, HexUtils, PasswordUtils } from "~Utils"
import { Keychain } from "~Storage"
import SaltHelper from "./SaltHelper"
import { ACCESS_CONTROL, Options } from "react-native-keychain"

const WALLET_ENCRYPTION_KEY_STORAGE = "WALLET_ENCRYPTION_KEY_STORAGE"
const WALLET_BIOMETRIC_KEY_STORAGE = "WALLET_BIOMETRIC_KEY_STORAGE"

const get = async (pinCode?: string, isLegacy?: boolean): Promise<WalletEncryptionKey> => {
    const keys = await Keychain.get({
        key: pinCode ? WALLET_ENCRYPTION_KEY_STORAGE : WALLET_BIOMETRIC_KEY_STORAGE,
        options: {
            accessControl: pinCode ? undefined : ACCESS_CONTROL.BIOMETRY_ANY_OR_DEVICE_PASSCODE,
        },
    })

    if (!keys) throw new Error("WalletEncryptionKeyHelper: No key found")

    if (pinCode) {
        const { salt, iv: base64IV } = await SaltHelper.getSaltAndIV()
        const iv = PasswordUtils.base64ToBuffer(base64IV)
        let decryptedKeys: WalletEncryptionKey = await CryptoUtils.decrypt(keys, pinCode, salt, iv)
        if (isLegacy) {
            decryptedKeys = await CryptoUtils_Legacy.decrypt(keys, pinCode, salt)
        } else {
            decryptedKeys = await CryptoUtils.decrypt(keys, pinCode, salt, iv)
        }
        return decryptedKeys
    } else {
        return JSON.parse(keys) as WalletEncryptionKey
    }
}

const setWithPinCode = async (encryptionKeys: WalletEncryptionKey, pinCode: string) => {
    const { salt, iv: base64IV } = await SaltHelper.getSaltAndIV()
    const iv = PasswordUtils.base64ToBuffer(base64IV)

    const encryptedKeys = await CryptoUtils.encrypt(encryptionKeys, pinCode, salt, iv)

    await Keychain.set({
        key: WALLET_ENCRYPTION_KEY_STORAGE,
        value: encryptedKeys,
    })
}

const setWithBiometric = async (encryptionKeys: WalletEncryptionKey) => {
    const encryptedKeys = JSON.stringify(encryptionKeys)

    const options: Options = {
        accessControl: ACCESS_CONTROL.BIOMETRY_ANY_OR_DEVICE_PASSCODE,
    }

    await Keychain.set({
        key: WALLET_BIOMETRIC_KEY_STORAGE,
        options,
        value: encryptedKeys,
    })
}

const set = async (encryptionKeys: WalletEncryptionKey, pinCode?: string) => {
    if (pinCode) {
        await setWithPinCode(encryptionKeys, pinCode)
    } else {
        await setWithBiometric(encryptionKeys)
    }
}

const decryptWallet = async (encryptedWallet: string, pinCode?: string): Promise<Wallet> => {
    const { walletKey } = await get(pinCode)
    const { salt, iv: base64IV } = await SaltHelper.getSaltAndIV()
    const iv = PasswordUtils.base64ToBuffer(base64IV)
    const wallet = await CryptoUtils.decrypt<Wallet>(encryptedWallet, walletKey, salt, iv)
    return wallet
}

const encryptWallet = async (wallet: Wallet, pinCode?: string) => {
    const { walletKey } = await get(pinCode)
    const { salt, iv: base64IV } = await SaltHelper.getSaltAndIV()
    const iv = PasswordUtils.base64ToBuffer(base64IV)
    const walletEncrypted = await CryptoUtils.encrypt(wallet, walletKey, salt, iv)
    return walletEncrypted
}

const remove = async () => {
    await Keychain.deleteItem({
        key: WALLET_BIOMETRIC_KEY_STORAGE,
    })

    await Keychain.deleteItem({
        key: WALLET_ENCRYPTION_KEY_STORAGE,
    })
}

const init = async (pinCode?: string) => {
    await remove()

    const encryptionKeys: WalletEncryptionKey = {
        walletKey: HexUtils.generateRandom(256),
    }

    await set(encryptionKeys, pinCode)
}

export default {
    set,
    get,
    decryptWallet,
    encryptWallet,
    init,
    remove,
}
