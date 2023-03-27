import { useCallback } from "react"
import {
    CryptoUtils,
    PasswordUtils,
    WalletSecurity,
    useWalletSecurity,
} from "~Common"
import { UserSelectedSecurityLevel, Wallet } from "~Model"
import KeychainService from "~Services/KeychainService"
import { useAppDispatch, useAppSelector } from "~Storage/Redux"
import { setUserSelectedSecurity, updateDevice } from "~Storage/Redux/Actions"
import { getDevices } from "~Storage/Redux/Selectors"

export const useSecurityUpgrade = () => {
    const { walletSecurity } = useWalletSecurity()
    const devices = useAppSelector(getDevices())

    const dispatch = useAppDispatch()

    const runSecurityUpgrade = useCallback(
        async (password: string, onSuccessCallback?: () => void) => {
            if (walletSecurity === WalletSecurity.BIO_UNLOCK) return

            for (const device of devices) {
                const deviceKey = await KeychainService.getDeviceEncryptionKey(
                    device.rootAddress,
                    false,
                )
                if (!deviceKey) throw new Error("No encryption key for device")

                const decryptedKey = CryptoUtils.decrypt<string>(
                    deviceKey,
                    PasswordUtils.hash(password),
                )
                const decryptedWallet = CryptoUtils.decrypt<Wallet>(
                    device.wallet,
                    decryptedKey,
                )

                const { encryptedWallet: updatedEncryptedWallet } =
                    await CryptoUtils.encryptWallet(
                        decryptedWallet,
                        device.rootAddress,
                        true,
                    )

                dispatch(
                    updateDevice({
                        rootAddress: device.rootAddress,
                        device: {
                            ...device,
                            wallet: updatedEncryptedWallet,
                        },
                    }),
                )
            }

            dispatch(
                setUserSelectedSecurity(UserSelectedSecurityLevel.BIOMETRIC),
            )

            onSuccessCallback && onSuccessCallback()
        },
        [walletSecurity, dispatch, devices],
    )

    return runSecurityUpgrade
}
