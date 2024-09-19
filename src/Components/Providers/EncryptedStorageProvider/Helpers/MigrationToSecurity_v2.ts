import { Wallet } from "~Model"
import StorageEncryptionKeyHelper from "./StorageEncryptionKeyHelper"
import WalletEncryptionKeyHelper from "./WalletEncryptionKeyHelper"
import { CryptoUtils_Legacy, error } from "~Utils"
import { ERROR_EVENTS } from "~Constants"

const getMnemonicsFromStorage = async (persistedState: any, password?: string) => {
    if (!persistedState) throw new Error("No persisted state found")

    // Get the storage keys
    const storageEncryptionKeys = await StorageEncryptionKeyHelper.get({ pinCode: password, isLegacy: true })
    const reduxKey = storageEncryptionKeys.redux

    // Get the encrypted state for redux
    const oldState = JSON.parse(persistedState)

    let wallets: Wallet[] = []

    // Get data related to the decryption/Encryprion of the wallet keys here (instead of doing it inside the loop for every wallet)
    // so we can reduce the amount of prompting since keys are the same for each wallet
    const { walletKey } = await WalletEncryptionKeyHelper.get({ pinCode: password, isLegacy: true })

    // Go over the state enreies and decrypt them
    for (const key in oldState) {
        if (!oldState.hasOwnProperty(key)) return

        const encrypted = oldState[key] as string
        const toDecrypt = encrypted.replace(/['"]+/g, "").replace("0x", "")
        const unencrypted = CryptoUtils_Legacy.decryptState(toDecrypt, reduxKey)
        const parsedEntryInState = JSON.parse(unencrypted)

        // Get wallets from unencrypted entries and decrypt them
        if (key === "devices") {
            if ("wallet" in parsedEntryInState[0] && "xPub" in parsedEntryInState[0]) {
                // loop on parsedEntryInState for wallets
                for (const wallet of parsedEntryInState) {
                    // and decrypt each wallet
                    const decryptedWallet: Wallet = CryptoUtils_Legacy.decrypt<Wallet>(wallet.wallet, walletKey)

                    if (!decryptedWallet.mnemonic) {
                        error(ERROR_EVENTS.ENCRYPTION, "No mnemonic found for wallet")
                        return
                    }

                    wallets.push(decryptedWallet)
                }
            }
        }
    }

    return wallets
}

export default { getMnemonicsFromStorage }
