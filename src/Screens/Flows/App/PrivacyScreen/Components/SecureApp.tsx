import React, { useCallback, useMemo, useState } from "react"
import { BaseSwitch, BaseText, BaseView } from "~Components"
import { WALLET_STATUS } from "~Model"
import { useRealm, getUserPreferences, getAppLock } from "~Storage"

export const SecureApp = () => {
    const { store, cache } = useRealm()

    const userPreferences = getUserPreferences(store)

    const isEnabled = useMemo(
        () => userPreferences.isAppLockActive,
        [userPreferences],
    )
    const [isAppLock, setIsAppLock] = useState(isEnabled)

    const toggleSwitch = useCallback(
        (newValue: boolean) => {
            setIsAppLock(newValue)

            const appLock = getAppLock(cache)

            cache.write(() => {
                if (appLock) {
                    appLock.status = WALLET_STATUS.UNLOCKED
                }
            })

            store.write(() => {
                userPreferences.isAppLockActive = newValue
            })
        },
        [cache, userPreferences, store],
    )

    return (
        <BaseView
            justify="space-between"
            w={100}
            align="center"
            orientation="row">
            <BaseText>Secure App</BaseText>
            <BaseSwitch onValueChange={toggleSwitch} value={isAppLock} />
        </BaseView>
    )
}
