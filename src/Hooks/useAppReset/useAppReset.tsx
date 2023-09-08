import { useCallback } from "react"
import { useWalletSecurity } from "~Hooks/useWalletSecurity"
import KeychainService from "~Services/KeychainService"
import MetadataCache from "~Storage/PersistedCache/MetadataCache"
import { CACHE_METADATA_KEY } from "~Storage/PersistedCache/constants"
import { resetApp, useAppDispatch, useAppSelector } from "~Storage/Redux"
import { selectDevices } from "~Storage/Redux/Selectors"
import { info } from "~Utils/Logger"

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

        promises.push(KeychainService.deleteKey(CACHE_METADATA_KEY))

        await Promise.all(promises)
    }, [devices, isWalletSecurityBiometrics])

    const appReset = useCallback(async () => {
        await removeEncryptionKeysFromKeychain()
        await dispatch(resetApp())
        MetadataCache.reset()
        info("App Reset Finished")
    }, [dispatch, removeEncryptionKeysFromKeychain])

    return appReset
}
