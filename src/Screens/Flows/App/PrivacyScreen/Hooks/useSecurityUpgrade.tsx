import { useCallback } from "react"
import {
    CryptoUtils,
    PasswordUtils,
    WalletSecurity,
    useWalletSecurity,
} from "~Common"
import { UserSelectedSecurityLevel, Wallet } from "~Model"
import KeychainService from "~Services/KeychainService"
import { getDevices, useRealm } from "~Storage"
import { useAppDispatch } from "~Storage/Redux"
import { setUserSelectedSecurity } from "~Storage/Redux/Actions"

export const useSecurityUpgrade = () => {
    const { walletSecurity } = useWalletSecurity()

    const { store } = useRealm()

    const devices = getDevices(store)

    const dispatch = useAppDispatch()

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

            store.commitTransaction()

            dispatch(
                setUserSelectedSecurity(UserSelectedSecurityLevel.BIOMETRIC),
            )

            onSuccessCallback && onSuccessCallback()
        },
        [walletSecurity, store, dispatch, devices],
    )

    return runSecurityUpgrade
}
