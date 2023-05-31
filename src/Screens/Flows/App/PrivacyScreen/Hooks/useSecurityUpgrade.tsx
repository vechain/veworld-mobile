import { useCallback } from "react"
import { useWalletSecurity, error } from "~Common"
import { LocalDevice, SecurityLevelType } from "~Model"
import { CryptoUtils } from "~Utils"
import {
    selectLocalDevices,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"
import {
    bulkUpdateDevices,
    setUserSelectedSecurity,
} from "~Storage/Redux/Actions"

/**
 *  hook to trigger the security upgrade by decrypting and re-encrypting the wallet with the new security level
 * @returns  a function to trigger the security upgrade
 */

export const useSecurityUpgrade = () => {
    const { isWalletSecurityBiometrics } = useWalletSecurity()
    const devices = useAppSelector(selectLocalDevices) as LocalDevice[]
    const dispatch = useAppDispatch()

    const runSecurityUpgrade = useCallback(
        async (password: string, onSuccessCallback?: () => void) => {
            if (isWalletSecurityBiometrics) return

            const updatedDevices: LocalDevice[] = []

            // todo -> use atomic commit to update all devices at once #567
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

                onSuccessCallback?.()
            } catch (e) {
                error("SECURITY UPGRADE ERROR", e)
            }
        },
        [isWalletSecurityBiometrics, dispatch, devices],
    )

    return runSecurityUpgrade
}
