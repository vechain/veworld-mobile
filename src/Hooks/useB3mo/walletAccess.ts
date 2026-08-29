import { HDNode } from "thor-devkit"
import SaltHelper from "~Components/Providers/EncryptedStorageProvider/Helpers/SaltHelper"
import { CryptoUtils, PasswordUtils } from "~Utils"
import type { Wallet } from "~Model"

export async function decryptWalletWithKey(encryptedWallet: string, walletKey: string): Promise<Wallet> {
    const { salt, iv: base64IV } = await SaltHelper.getSaltAndIV()
    const iv = PasswordUtils.base64ToBuffer(base64IV)
    return CryptoUtils.decrypt<Wallet>(encryptedWallet, walletKey, salt, iv)
}

export function derivePrivateKey(wallet: Wallet, accountIndex: number): Buffer {
    if (!wallet.mnemonic) {
        throw new Error("B3MO requires a mnemonic-based wallet")
    }
    const hdNode = HDNode.fromMnemonic(wallet.mnemonic, wallet.derivationPath)
    const derived = hdNode.derive(accountIndex)
    if (!derived.privateKey) {
        throw new Error("Failed to derive private key for B3MO account")
    }
    return derived.privateKey
}
