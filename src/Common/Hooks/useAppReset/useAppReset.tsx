import { useCallback } from "react"
import { WALLET_STATUS } from "~Model"
import KeychainService from "~Services/KeychainService"
import { useRealm, getAppLock, getNetworks, getUserPreferences } from "~Storage"
import Realm from "realm"
import { purgeStoredState } from "redux-persist"
import {
    getPersistorConfig,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"
import { getDevices } from "~Storage/Redux/Selectors"

export const useAppReset = () => {
    const { store, cache } = useRealm()
    const dispatch = useAppDispatch()
    const devices = useAppSelector(getDevices())

    const removeDevicesFromKeychain = useCallback(async () => {
        const promises = devices.map(device => {
            return KeychainService.deleteDeviceMnemonic(device.rootAddress)
        })

        await Promise.all(promises)
    }, [devices])

    const appReset = useCallback(async () => {
        await removeDevicesFromKeychain()

        resetRealm(store, cache)

        const persistConfig = await getPersistorConfig()
        purgeStoredState(persistConfig)
        dispatch({ type: "RESET" })
        console.log("App Reset Finished")
    }, [removeDevicesFromKeychain, cache, dispatch, store])

    return appReset
}

const resetRealm = async (store: Realm, cache: Realm) => {
    const appLock = getAppLock(cache)

    cache.write(() => {
        appLock.status = WALLET_STATUS.LOCKED
    })

    const networks = getNetworks(store)
    const userPreferences = getUserPreferences(store)

    store.write(() => {
        userPreferences.currentNetwork = networks[0]
        userPreferences.showTestNetTag = true
        userPreferences.showConversionOtherNets = true
        userPreferences.isAppLockActive =
            process.env.NODE_ENV === "development" ? false : true
        userPreferences.balanceVisible = true
        userPreferences.currency = "usd"
        userPreferences.language = "English"
    })
}
