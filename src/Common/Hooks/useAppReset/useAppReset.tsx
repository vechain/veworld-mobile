import { useCallback } from "react"
import KeychainService from "~Services/KeychainService"
import { purgeStoredState } from "redux-persist"
import {
    getPersistorConfig,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"
import { selectDevices } from "~Storage/Redux/Selectors"
import { info } from "~Common/Logger"

// TODO: test it, currently there is no way to test it, there is an error on mocking redux persist
export const useAppReset = () => {
    const dispatch = useAppDispatch()
    const devices = useAppSelector(selectDevices())

    // for every device delete the encryption keys from keychain
    const removeEncryptionKeysFromKeychain = useCallback(async () => {
        const promises = devices.map(device => {
            return KeychainService.deleteDeviceEncryptionKey(device.rootAddress)
        })
        await Promise.all(promises)
    }, [devices])

    const appReset = useCallback(async () => {
        await removeEncryptionKeysFromKeychain()
        const persistConfig = await getPersistorConfig()
        purgeStoredState(persistConfig) // clean redux-persist store
        dispatch({ type: "RESET" }) // clean redux store (used by redux-reset)
        info("App Reset Finished")
    }, [removeEncryptionKeysFromKeychain, dispatch])

    return appReset
}
