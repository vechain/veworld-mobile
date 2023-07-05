import { useCallback } from "react"
import { useWalletSecurity } from "~Hooks/useWalletSecurity"
import KeychainService from "~Services/KeychainService"
import { resetApp, useAppDispatch, useAppSelector } from "~Storage/Redux"
import { selectDevices } from "~Storage/Redux/Selectors"
import { info } from "~Utils/Logger"

// TODO: test it, currently there is no way to test it, there is an error on mocking redux persist
export const useAppReset = () => {
    const dispatch = useAppDispatch()
    const devices = useAppSelector(selectDevices)

    const { isWalletSecurityBiometrics } = useWalletSecurity()

    // for every device delete the encryption keys from keychain
    const removeEncryptionKeysFromKeychain = useCallback(async () => {
        const promises = devices.map(device => {
            return KeychainService.deleteDeviceEncryptionKey(
                device.rootAddress,
                isWalletSecurityBiometrics,
            )
        })
        await Promise.all(promises)
    }, [devices, isWalletSecurityBiometrics])

    const appReset = useCallback(async () => {
        await removeEncryptionKeysFromKeychain()

        await dispatch(resetApp())

        info("App Reset Finished")
    }, [dispatch, removeEncryptionKeysFromKeychain])

    return appReset
}
