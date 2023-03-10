import React, { useCallback, useMemo, useState } from "react"
import { Switch } from "react-native"
import { BaseText, BaseView } from "~Components"
import { WALLET_STATUS } from "~Model"
import { AppLock, UserPreferences, useRealm } from "~Storage"

export const SecureApp = () => {
    const { store, cache } = useRealm()

    const userPref = store.objectForPrimaryKey<UserPreferences>(
        UserPreferences.getName(),
        UserPreferences.getPrimaryKey(),
    )

    const isEnabled = useMemo(() => userPref!.isAppLockActive, [userPref])
    const [isAppLock, setIsAppLock] = useState(isEnabled)

    const toggleSwitch = useCallback(
        (newValue: boolean) => {
            setIsAppLock(newValue)

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
                userPref!.isAppLockActive = newValue
            })
        },
        [cache, userPref, store],
    )

    return (
        <BaseView
            justify="space-between"
            w={100}
            align="center"
            orientation="row">
            <BaseText>Secure App</BaseText>
            <Switch onValueChange={toggleSwitch} value={isAppLock} />
        </BaseView>
    )
}
