import { useCallback } from "react"
import { useWalletSecurity, error } from "~Common"
import { CryptoUtils } from "~Utils"
import { Device, SecurityLevelType } from "~Model"
import { useAppDispatch, useAppSelector } from "~Storage/Redux"
import {
    bulkUpdateDevices,
    setUserSelectedSecurity,
} from "~Storage/Redux/Actions"
import { selectDevices } from "~Storage/Redux/Selectors"

export const useSecurityUpgrade = () => {
    const { isWalletSecurityBiometrics } = useWalletSecurity()
    const devices = useAppSelector(selectDevices())
    const dispatch = useAppDispatch()

    const runSecurityUpgrade = useCallback(
        async (password: string, onSuccessCallback?: () => void) => {
            if (isWalletSecurityBiometrics) return

            const updatedDevices: Device[] = []

            try {
                for (const device of devices) {
                    const { decryptedWallet } = await CryptoUtils.decryptWallet(
                        device,
                        password,
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

                dispatch(setUserSelectedSecurity(SecurityLevelType.BIOMETRIC))

                onSuccessCallback && onSuccessCallback()
            } catch (e) {
                error("SECURITY UPGRADE ERROR", e)
            }
        },
        [isWalletSecurityBiometrics, dispatch, devices],
    )

    return runSecurityUpgrade
}
