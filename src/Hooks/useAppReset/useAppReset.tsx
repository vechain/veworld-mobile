import { useCallback } from "react"
import { useWalletSecurity } from "~Hooks/useWalletSecurity"
import KeychainService from "~Services/KeychainService"
import {
    TokenMetadataCache as tokenMetadataCache,
    TokenMediaCache as tokenMediaCache,
    initTokenMediaCache,
    initTokenMetadataCache,
} from "~Storage/PersistedCache"

import {
    CACHE_TOKEN_MEDIA_KEY,
    CACHE_TOKEN_METADATA_KEY,
} from "~Storage/PersistedCache/constants"
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

        promises.push(KeychainService.deleteKey(CACHE_TOKEN_MEDIA_KEY))
        promises.push(KeychainService.deleteKey(CACHE_TOKEN_METADATA_KEY))

        await Promise.all(promises)
    }, [devices, isWalletSecurityBiometrics])

    const appReset = useCallback(async () => {
        await removeEncryptionKeysFromKeychain()
        await dispatch(resetApp())
        tokenMetadataCache?.reset()
        tokenMediaCache?.reset()

        // TODO: Restarting the app would be better than initializing the cache again. However we are working through a known issue with react-native-restart
        initTokenMetadataCache()
        initTokenMediaCache()

        info("App Reset Finished")
    }, [removeEncryptionKeysFromKeychain, dispatch])

    return appReset
}
