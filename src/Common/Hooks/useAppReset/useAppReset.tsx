import { useCallback } from "react"
import { WALLET_STATUS } from "~Model"
import KeychainService from "~Services/KeychainService"
import {
    Device,
    useRealm,
    getAppLock,
    getNetworks,
    getUserPreferences,
    getAccounts,
    getDevices,
    getXPub,
} from "~Storage"
import Realm from "realm"
import { purgeStoredState } from "redux-persist"
import { getPersistorConfig, useAppDispatch } from "~Storage/Redux"
import { AppDispatch } from "~Storage/Redux/Types"

export const useAppReset = () => {
    const { store, cache } = useRealm()
    const dispatch = useAppDispatch()

    const appReset = useCallback(async () => {
        const devices = getDevices(store)

        try {
            await loopOverAndDeleteDevices(devices)
        } catch (error) {
            console.log("Error deleting Keychain Entries", error)
            const _devices = getDevices(store)
            if (_devices.length > 0) {
                loopOverAndDeleteDevices(_devices)
            }
        }

        resetRealm(store, cache, dispatch)
    }, [cache, dispatch, store])

    return appReset
}

const loopOverAndDeleteDevices = async (
    devices: Realm.Results<Device & Realm.Object<unknown, never>>,
) => {
    for (const device of devices) {
        try {
            await KeychainService.deleteItem(device.index)
        } catch (error) {
            console.log("Error deleting Keychain Entries", error)
        }
    }
}

const resetRealm = async (
    store: Realm,
    cache: Realm,
    dispatch: AppDispatch,
) => {
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
        userPreferences.selectedAccount = undefined
        userPreferences.balanceVisible = true

        store.delete(getDevices(store))
        store.delete(getAccounts(store))
        store.delete(getXPub(store))
    })

    const persistConfig = await getPersistorConfig()
    purgeStoredState(persistConfig)
    dispatch({ type: "RESET" })
    console.log("App Reset Finished")
}
