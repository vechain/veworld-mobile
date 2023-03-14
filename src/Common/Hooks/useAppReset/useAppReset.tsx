import { useCallback } from "react"
import { WALLET_STATUS } from "~Model"
import KeychainService from "~Services/KeychainService"
import {
    Account,
    AppLock,
    Config,
    Device,
    Network,
    UserPreferences,
    XPub,
    useRealm,
} from "~Storage"
import Realm from "realm"
import { SettingsConstants } from "~Common/Constant"

export const useAppReset = () => {
    const { store, cache } = useRealm()

    const appReset = useCallback(async () => {
        const devices = store.objects<Device>(Device.getName())

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
    const appLock = cache.objectForPrimaryKey<AppLock>(
        AppLock.getName(),
        AppLock.getPrimaryKey(),
    )

    cache.write(() => {
        appLock!.status = WALLET_STATUS.LOCKED
    })

    let config = store.objectForPrimaryKey<Config>(
        Config.getName(),
        Config.getPrimaryKey(),
    )

    const networks = store.objects<Network>(Network.getName())
    const userPreferences = store.objectForPrimaryKey<UserPreferences>(
        UserPreferences.getName(),
        UserPreferences.getPrimaryKey(),
    )

    store.write(() => {
        config!.userSelectedSecurity = "NONE"
        config!.lastSecurityLevel = "NONE"
        config!.isSecurityDowngrade = false
        config!.pinValidationString = SettingsConstants.VALIDATION_STRING

        userPreferences!.currentNetwork = networks[0]
        userPreferences!.showTestNetTag = true
        userPreferences!.showConversionOtherNets = true
        userPreferences!.isAppLockActive = true
        userPreferences!.selectedAccount = undefined
        userPreferences!.balanceVisible = true

        store.delete(store.objects(Device.getName()))
        store.delete(store.objects(Account.getName()))
        store.delete(store.objects(XPub.getName()))

        config!.isWalletCreated = false
        config!.isResettingApp = false

        console.log("App Reset Finished")
    })
}
