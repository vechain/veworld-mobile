import { useCallback } from "react"
import { WALLET_STATUS } from "~Model"
import KeychainService from "~Services/KeychainService"
import {
    Device,
    useRealm,
    getAppLock,
    getConfig,
    getNetworks,
    getUserPreferences,
    getAccounts,
    getDevices,
    getXPub,
} from "~Storage"
import Realm from "realm"
import { SettingsConstants } from "~Common/Constant"

export const useAppReset = () => {
    const { store, cache } = useRealm()

    const appReset = useCallback(async () => {
        const devices = getDevices(store)

        try {
            await loopOverAndDeleteDevices(devices)
        } catch (error) {
            console.log("Error deleting Keychain Entries", error)
            const _devices = store.objects<Device>(Device.getName())
            if (_devices.length > 0) {
                loopOverAndDeleteDevices(_devices)
            }
        }

        resetRealm(store, cache)
    }, [cache, store])

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

const resetRealm = async (store: Realm, cache: Realm) => {
    const appLock = getAppLock(cache)

    cache.write(() => {
        appLock!.status = WALLET_STATUS.LOCKED
        activeWalletCard!.activeIndex = 0
    })

    const config = getConfig(store)

    const networks = getNetworks(store)
    const userPreferences = getUserPreferences(store)

    store.write(() => {
        config!.userSelectedSecurity = "NONE"
        config!.lastSecurityLevel = "NONE"
        config!.isSecurityDowngrade = false
        config!.pinValidationString = SettingsConstants.VALIDATION_STRING

        userPreferences!.currentNetwork = networks[0]
        userPreferences!.showTestNetTag = true
        userPreferences!.showConversionOtherNets = true
        userPreferences!.isAppLockActive = true

        store.delete(getDevices(store))
        store.delete(getAccounts(store))
        store.delete(getXPub(store))

        config!.isWalletCreated = false
        config!.isResettingApp = false

        console.log("App Reset Finished")
    })
}
