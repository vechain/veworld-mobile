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
                    const isLegacy = true
                    const decryptedWallet: Wallet = await WalletEncryptionKeyHelper.decryptWallet({
                        encryptedWallet: wallet.wallet,
                        pinCode: password,
                        isLegacy,
                    })

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
