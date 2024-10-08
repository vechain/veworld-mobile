import { BackupWallet, DEVICE_TYPE, Wallet } from "~Model"
import StorageEncryptionKeyHelper from "./StorageEncryptionKeyHelper"
import WalletEncryptionKeyHelper from "./WalletEncryptionKeyHelper"
import { CryptoUtils_Legacy, info } from "~Utils"
import { ERROR_EVENTS } from "~Constants"

type BackupWalletTypeCheck = {
    isOnlyLedger: boolean | undefined
    inOnlyPrivateKey: boolean | undefined
    localWallets: BackupWallet[] | undefined
}

const getMnemonicsFromStorage = async (persistedState: any, password?: string): Promise<BackupWalletTypeCheck> => {
    if (!persistedState) throw new Error("No persisted state found")

    // Get the storage keys
    const storageEncryptionKeys = await StorageEncryptionKeyHelper.get({ pinCode: password, isLegacy: true })
    const reduxKey = storageEncryptionKeys.redux

    // Get the encrypted state for redux
    const oldState = JSON.parse(persistedState)

    // Get data related to the decryption/Encryprion of the wallet keys here (instead of doing it inside the loop for every wallet)
    // so we can reduce the amount of prompting since keys are the same for each wallet
    const { walletKey } = await WalletEncryptionKeyHelper.get({ pinCode: password, isLegacy: true })

    const localWallets = getLocalWallets(oldState, reduxKey, walletKey)
    const isOnlyLedger = getLedgerWallets(oldState, reduxKey)
    const inOnlyPrivateKey = getPrivateKeyWallets(oldState, reduxKey)

    return { isOnlyLedger, inOnlyPrivateKey, localWallets }
}

const getLocalWallets = (oldState: any, reduxKey: string, walletKey: string) => {
    let wallets: BackupWallet[] = []

    // Go over the state enreies and decrypt them
    for (const key in oldState) {
        if (!oldState.hasOwnProperty(key)) return

        const encrypted = oldState[key] as string
        const toDecrypt = encrypted.replace(/['"]+/g, "").replace("0x", "")
        const unencrypted = CryptoUtils_Legacy.decryptState(toDecrypt, reduxKey)
        const parsedEntryInState = JSON.parse(unencrypted)

        // Get wallets from unencrypted entries and decrypt them
        if (key === "devices") {
            for (const wallet of parsedEntryInState) {
                if (wallet.type === DEVICE_TYPE.LOCAL_MNEMONIC) {
                    let decryptedWallet: Wallet = {
                        rootAddress: wallet.rootAddress,
                        nonce: wallet.rootAddress,
                    }

                    try {
                        if (wallet.type === DEVICE_TYPE.LOCAL_MNEMONIC) {
                            decryptedWallet = CryptoUtils_Legacy.decrypt<Wallet>(wallet.wallet, walletKey)
                        }
                    } catch (error) {
                        info(ERROR_EVENTS.ENCRYPTION, `Error decrypting wallet: ${error} for wallet: ${wallet}`)
                    }

                    wallets.push({
                        ...decryptedWallet,
                        type: wallet.type,
                        alias: wallet.alias,
                        derivationPath: wallet.derivationPath,
                    })
                }
            }
        }
    }

    return wallets
}

const getLedgerWallets = (oldState: any, reduxKey: string) => {
    // Go over the state enreies and decrypt them
    for (const key in oldState) {
        if (!oldState.hasOwnProperty(key)) return

        const encrypted = oldState[key] as string
        const toDecrypt = encrypted.replace(/['"]+/g, "").replace("0x", "")
        const unencrypted = CryptoUtils_Legacy.decryptState(toDecrypt, reduxKey)
        const parsedEntryInState = JSON.parse(unencrypted)

        if (key === "devices") {
            return parsedEntryInState.length === 1 && parsedEntryInState[0].type === DEVICE_TYPE.LEDGER
        }
    }
}

const getPrivateKeyWallets = (oldState: any, reduxKey: string) => {
    // Go over the state enreies and decrypt them
    for (const key in oldState) {
        if (!oldState.hasOwnProperty(key)) return

        const encrypted = oldState[key] as string
        const toDecrypt = encrypted.replace(/['"]+/g, "").replace("0x", "")
        const unencrypted = CryptoUtils_Legacy.decryptState(toDecrypt, reduxKey)
        const parsedEntryInState = JSON.parse(unencrypted)

        if (key === "devices") {
            return parsedEntryInState.length === 1 && parsedEntryInState[0].type === DEVICE_TYPE.LOCAL_PRIVATE_KEY
        }
    }
}

export default { getMnemonicsFromStorage }
