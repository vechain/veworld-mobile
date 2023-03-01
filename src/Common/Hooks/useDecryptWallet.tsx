import { useCallback } from "react"
import { CryptoUtils, PasswordUtils } from "~Common/Utils"
import { Wallet } from "~Model"
import KeychainService from "~Services/KeychainService"
import { Device } from "~Storage"

export const useDecryptWallet = () => {
    const decryptWithBiometrics = useCallback(
        async (device: Device): Promise<Wallet> => {
            let encryptedKey = await KeychainService.getEncryptionKey(
                device.index,
                true,
            )

            let wallet: Wallet | null = null

            if (encryptedKey) {
                let _wallet = CryptoUtils.decrypt<Wallet>(
                    device.wallet,
                    encryptedKey,
                )

                wallet = _wallet
            }

            if (!wallet) {
                throw new Error("Unable to decrypt wallet")
            }

            return wallet
        },
        [],
    )

    const decryptWithPassword = useCallback(
        async (device: Device, userPassword: string): Promise<Wallet> => {
            let encryptedKey = await KeychainService.getEncryptionKey(
                device.index,
            )

            let wallet: Wallet | null = null

            if (encryptedKey) {
                const hashedKey = PasswordUtils.hash(userPassword)
                let decryptedKey = CryptoUtils.decrypt<string>(
                    encryptedKey,
                    hashedKey,
                )
                let _wallet = CryptoUtils.decrypt<Wallet>(
                    device.wallet,
                    decryptedKey,
                )

                wallet = _wallet
            }

            if (!wallet) {
                throw new Error("Unable to decrypt wallet")
            }

            return wallet
        },
        [],
    )

    return { decryptWithBiometrics, decryptWithPassword }
}
