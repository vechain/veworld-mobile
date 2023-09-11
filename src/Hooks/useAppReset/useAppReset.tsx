import { useCallback } from "react"
import { usePersistedCache } from "~Components/Providers/PersistedCacheProvider"
import { useWalletSecurity } from "~Hooks/useWalletSecurity"
import KeychainService from "~Services/KeychainService"

import {
    CACHE_NFT_MEDIA_KEY,
    CACHE_NFT_METADATA_KEY,
} from "~Storage/PersistedCache/constants"
import { resetApp, useAppDispatch, useAppSelector } from "~Storage/Redux"
import { selectDevices } from "~Storage/Redux/Selectors"
import { info } from "~Utils/Logger"
import { useEncryptedStorage } from "~Components"
import { useResetStacks } from "~Hooks/useSetSelectedAccount/useResetStacks"

export const useAppReset = () => {
    const dispatch = useAppDispatch()
    const { resetAllCaches, initAllCaches } = usePersistedCache()
    const { resetApplication } = useEncryptedStorage()
    const { resetStacks } = useResetStacks()
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

        promises.push(KeychainService.deleteKey(CACHE_NFT_MEDIA_KEY))
        promises.push(KeychainService.deleteKey(CACHE_NFT_METADATA_KEY))

        await Promise.all(promises)
    }, [devices, isWalletSecurityBiometrics])

    return useCallback(async () => {
        await removeEncryptionKeysFromKeychain()
        await dispatch(resetApp())

        resetStacks()

        await resetAllCaches()

        await resetApplication()

        // TODO: Move this to a more appropriate place
        await initAllCaches()

        info("App Reset Finished")
    }, [
        resetStacks,
        removeEncryptionKeysFromKeychain,
        resetAllCaches,
        initAllCaches,
        resetApplication,
        dispatch,
    ])
}
