import { useCallback } from "react"
import KeychainService from "~Services/KeychainService"
import { purgeStoredState } from "redux-persist"
import {
    getPersistorConfig,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"
import { getDevices } from "~Storage/Redux/Selectors"

export const useAppReset = () => {
    const dispatch = useAppDispatch()
    const devices = useAppSelector(getDevices())

    const removeEncryptionKeysFromKeychain = useCallback(async () => {
        const promises = devices.map(device => {
            return KeychainService.deleteDeviceEncryptionKey(device.rootAddress)
        })

        await Promise.all(promises)
    }, [devices])

    const appReset = useCallback(async () => {
        await removeEncryptionKeysFromKeychain()

        const persistConfig = await getPersistorConfig()
        purgeStoredState(persistConfig)
        dispatch({ type: "RESET" })
        console.log("App Reset Finished")
    }, [removeEncryptionKeysFromKeychain, dispatch])

    return appReset
}
