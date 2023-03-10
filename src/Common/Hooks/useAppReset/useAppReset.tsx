import { useCallback } from "react"
import { WALLET_STATUS } from "~Model"
import KeychainService from "~Services/KeychainService"
import {
    Account,
    SelectedAccount,
    AppLock,
    Config,
    Device,
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

    const selectedAccount = cache.objectForPrimaryKey<SelectedAccount>(
        SelectedAccount.getName(),
        SelectedAccount.getPrimaryKey(),
    )

    let config = store.objectForPrimaryKey<Config>(
        Config.getName(),
        Config.getPrimaryKey(),
    )

    store.write(() => {
        config!.userSelectedSecurity = "NONE"
        config!.isAppLockActive = true
        config!.lastSecurityLevel = "NONE"
        config!.isSecurityDowngrade = false
        config!.pinValidationString = SettingsConstants.VALIDATION_STRING

        store.delete(store.objects(Device.getName()))
        store.delete(store.objects(Account.getName()))
        store.delete(store.objects(XPub.getName()))

        config!.isWalletCreated = false
        config!.isResettingApp = false
        selectedAccount!.address = undefined

        console.log("App Reset Finished")
    })
}
