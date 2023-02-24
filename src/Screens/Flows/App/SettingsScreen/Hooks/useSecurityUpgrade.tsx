import { useCallback } from "react"
import {
    CryptoUtils,
    PasswordUtils,
    WalletSecurity,
    useWalletSecurity,
} from "~Common"
import { UserSelectedSecurityLevel, Wallet } from "~Model"
import KeychainService from "~Services/KeychainService"
import { Biometrics, Config, Device, useRealm } from "~Storage"

export const useSecurityUpgrade = () => {
    const { walletSecurity } = useWalletSecurity()

    const { store, cache } = useRealm()

    const devices = store.objects<Device>(Device.getName())

    const config = store.objectForPrimaryKey<Config>(
        Config.getName(),
        Config.getPrimaryKey(),
    )

    const biometrics = cache.objectForPrimaryKey<Biometrics>(
        Biometrics.getName(),
        Biometrics.getPrimaryKey(),
    )

    const runSecurityUpgrade = useCallback(
        async (password: string, onSuccessCallback?: () => void) => {
            if (walletSecurity === WalletSecurity.BIO_UNLOCK) return

            store.beginTransaction()

            for (const device of devices) {
                let encryptedKey = await KeychainService.getEncryptionKey(
                    device.index,
                    false,
                )
                if (encryptedKey) {
                    const decryptedKey = CryptoUtils.decrypt<string>(
                        encryptedKey,
                        PasswordUtils.hash(password),
                    )
                    let _wallet = CryptoUtils.decrypt<Wallet>(
                        device.wallet,
                        decryptedKey,
                    )

                    const { encryptedWallet: updatedEncryptedWallet } =
                        await CryptoUtils.encryptWallet(
                            _wallet,
                            device.index,
                            true,
                        )

                    device.wallet = updatedEncryptedWallet
                } else {
                    console.log(`No key for ${device.alias}`)
                }
            }

            if (config) {
                config.userSelectedSecurity =
                    UserSelectedSecurityLevel.BIOMETRIC
                store.commitTransaction()
                cache.write(() => {
                    if (biometrics) biometrics.accessControl = true
                })
                onSuccessCallback && onSuccessCallback()
            }
        },
        [store, cache, config, biometrics, devices, walletSecurity],
    )

    return runSecurityUpgrade
}
