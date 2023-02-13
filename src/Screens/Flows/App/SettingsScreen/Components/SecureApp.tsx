import React, { useCallback, useMemo } from "react"
import { Switch } from "react-native"
import { BaseText, BaseView } from "~Components"
import { WALLET_STATUS } from "~Model"
import {
    AppLock,
    Config,
    RealmClass,
    useCache,
    useStore,
    useStoreQuery,
} from "~Storage"

export const SecureApp = () => {
    const store = useStore()
    const cache = useCache()

    // todo: this is a workaround until the new version is installed
    const result = useStoreQuery(Config)
    const config = useMemo(() => result.sorted("_id"), [result])

    const isEnabled = useMemo(() => config[0].isAppLockActive, [config])

    const toggleSwitch = useCallback(
        (newValue: boolean) => {
            cache.write(() => {
                let appLock = cache.objectForPrimaryKey<AppLock>(
                    RealmClass.AppLock,
                    "APP_LOCK",
                )
                if (appLock) {
                    appLock.status = WALLET_STATUS.UNLOCKED
                }
            })
            store.write(() => {
                config[0].isAppLockActive = newValue
            })
        },
        [cache, config, store],
    )

    return (
        <BaseView
            justify="space-between"
            w={100}
            align="center"
            orientation="row">
            <BaseText>Secure App</BaseText>
            <Switch onValueChange={toggleSwitch} value={isEnabled} />
        </BaseView>
    )
}
