import React, { useEffect, useMemo, useState } from "react"
import { Switch } from "react-native"
// import { useUnlockFlow } from "~Common"
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

export const EnableBiometrics = () => {
    const store = useStore()
    const cache = useCache()

    // const unlockFlow = useUnlockFlow()
    // todo: this is a workaround until the new version is installed
    const result = useStoreQuery(Config)
    const config = useMemo(() => result.sorted("_id"), [result])

    const [isEnabled, setIsEnabled] = useState(config[0].isAppLockActive)
    const toggleSwitch = () => setIsEnabled(previousState => !previousState)

    useEffect(() => {
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
            config[0].isAppLockActive = isEnabled
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isEnabled])

    return (
        <BaseView
            justify="space-between"
            w={100}
            align="center"
            orientation="row">
            <BaseText>Enable Biometrics</BaseText>
            <Switch onValueChange={toggleSwitch} value={isEnabled} />
        </BaseView>
    )
}
