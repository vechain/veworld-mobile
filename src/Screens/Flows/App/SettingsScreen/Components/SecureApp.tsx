import React, { useCallback, useMemo } from "react"
import { Switch } from "react-native"
import { BaseText, BaseView } from "~Components"
import { WALLET_STATUS } from "~Model"
import { AppLock, Config, useRealm, useObjectListener } from "~Storage"

export const SecureApp = () => {
    const { store, cache } = useRealm()

    const config = useObjectListener(
        Config.getName(),
        Config.getPrimaryKey(),
        store,
    ) as Config

    const isEnabled = useMemo(() => config?.isAppLockActive, [config])

    const toggleSwitch = useCallback(
        (newValue: boolean) => {
            let appLock = cache.objectForPrimaryKey<AppLock>(
                AppLock.getName(),
                AppLock.getPrimaryKey(),
            )

            cache.write(() => {
                if (appLock) {
                    appLock.status = WALLET_STATUS.UNLOCKED
                }
            })

            store.write(() => {
                config.isAppLockActive = newValue
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
