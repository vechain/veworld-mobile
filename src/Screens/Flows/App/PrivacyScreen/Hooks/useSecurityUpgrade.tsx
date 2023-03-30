import { useCallback } from "react"
import { CryptoUtils, WalletSecurity, useWalletSecurity, error } from "~Common"
import { Device, UserSelectedSecurityLevel } from "~Model"
import { useAppDispatch, useAppSelector } from "~Storage/Redux"
import {
    bulkUpdateDevices,
    setUserSelectedSecurity,
} from "~Storage/Redux/Actions"
import { selectDevices } from "~Storage/Redux/Selectors"

export const useSecurityUpgrade = () => {
    const { walletSecurity } = useWalletSecurity()
    const devices = useAppSelector(selectDevices())

    const dispatch = useAppDispatch()

    const runSecurityUpgrade = useCallback(
        async (password: string, onSuccessCallback?: () => void) => {
            console.log(runSecurityUpgrade, { password })
            if (walletSecurity === WalletSecurity.BIO_UNLOCK) return

            const updatedDevices: Device[] = []

            try {
                for (const device of devices) {
                    const { decryptedWallet } = await CryptoUtils.decryptWallet(
                        {
                            device,
                            userPassword: password,
                        },
                    )

                    const { encryptedWallet: updatedEncryptedWallet } =
                        await CryptoUtils.encryptWallet({
                            wallet: decryptedWallet,
                            rootAddress: device.rootAddress,
                            accessControl: true,
                        })

                    const updatedDevice = {
                        ...device,
                        wallet: updatedEncryptedWallet,
                    }

                    updatedDevices.push(updatedDevice)
                }

                dispatch(bulkUpdateDevices(updatedDevices))

                dispatch(
                    setUserSelectedSecurity(
                        UserSelectedSecurityLevel.BIOMETRIC,
                    ),
                )

                onSuccessCallback && onSuccessCallback()
            } catch (e) {
                error("SECURITY UPGRADE ERROR", e)
            }
        },
        [walletSecurity, dispatch, devices],
    )

    return runSecurityUpgrade
}
