import { Wallet } from "~Model"
import { WalletEncryptionKey } from "~Components/Providers/EncryptedStorageProvider/Model"
import { CryptoUtils } from "~Utils"
import EncryptionKeyHelper from "./EncryptionKeyHelper"

const get = async (pinCode?: string): Promise<WalletEncryptionKey> => {
    const { walletKey } = await EncryptionKeyHelper.get(pinCode)

    return {
        walletKey,
    }
}

const decryptWallet = async (
    encryptedWallet: string,
    pinCode?: string,
): Promise<Wallet> => {
    const { walletKey } = await EncryptionKeyHelper.get(pinCode)

    return CryptoUtils.decrypt<Wallet>(encryptedWallet, walletKey)
}

const encryptWallet = async (wallet: Wallet, pinCode?: string) => {
    const { walletKey } = await EncryptionKeyHelper.get(pinCode)

    return CryptoUtils.encrypt(wallet, walletKey)
}

export default {
    get,
    decryptWallet,
    encryptWallet,
}
