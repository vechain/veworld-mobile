import { useCallback } from "react"
import KeychainService from "~Services/KeychainService"
import {
    CACHE_NFT_MEDIA_KEY,
    CACHE_NFT_METADATA_KEY,
} from "~Storage/PersistedCache/constants"
import { resetApp, useAppDispatch } from "~Storage/Redux"
import { info } from "~Utils/Logger"
import {
    useApplicationSecurity,
    usePersistedCache,
    usePersistedTheme,
} from "~Components/Providers"

export const useAppReset = () => {
    const dispatch = useAppDispatch()
    const { resetAllCaches, initAllCaches } = usePersistedCache()
    const { resetApplication } = useApplicationSecurity()
    const { resetThemeCache } = usePersistedTheme()

    // for every device delete the encryption keys from keychain
    const removeEncryptionKeysFromKeychain = useCallback(async () => {
        await Promise.all([
            KeychainService.deleteKey(CACHE_NFT_MEDIA_KEY),
            KeychainService.deleteKey(CACHE_NFT_METADATA_KEY),
        ])
    }, [])

    const resetCaches = useCallback(async () => {
        await resetAllCaches()
        await resetThemeCache()
    }, [resetAllCaches, resetThemeCache])

    return useCallback(async () => {
        await removeEncryptionKeysFromKeychain()

        await resetCaches()

        await resetApplication()

        // TODO: Move this to a more appropriate place
        await initAllCaches()

        await dispatch(resetApp())

        info("App Reset Finished")
    }, [
        removeEncryptionKeysFromKeychain,
        resetCaches,
        resetApplication,
        initAllCaches,
        dispatch,
    ])
}
