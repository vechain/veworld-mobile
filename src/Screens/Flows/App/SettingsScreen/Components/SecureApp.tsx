import React, { useCallback, useMemo } from "react"
import { Switch } from "react-native"
import { useConfigEntity } from "~Common/Hooks/Entities"
import { BaseText, BaseView } from "~Components"
import { WALLET_STATUS } from "~Model"
import { AppLock, useRealm } from "~Storage"

export const SecureApp = () => {
    const { store, cache } = useRealm()
    const configEntity = useConfigEntity()

    const isEnabled = useMemo(
        () => configEntity?.isAppLockActive,
        [configEntity],
    )

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
                configEntity.isAppLockActive = newValue
            })
        },
        [cache, configEntity, store],
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
