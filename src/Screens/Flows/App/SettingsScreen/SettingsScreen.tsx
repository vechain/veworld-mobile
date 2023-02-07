import React, { useEffect, useMemo, useState } from "react"
import { Switch } from "react-native"
import { BaseSafeArea, BaseSpacer, BaseText, BaseView } from "~Components"
import { AppLock, useCache, useCachedQuery } from "~Storage"

export const SettingsScreen = () => {
    const cache = useCache()
    // todo: this is a workaround until the new version is installed
    const result = useCachedQuery(AppLock)
    const appLock = useMemo(() => result.sorted("_id"), [result])

    const [isEnabled, setIsEnabled] = useState(
        appLock[0].status === "LOCKED" ? true : false,
    )
    const toggleSwitch = () => setIsEnabled(previousState => !previousState)

    useEffect(() => {
        cache.write(() => {
            appLock[0].status = isEnabled ? "LOCKED" : "UNLOCKED"
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cache, isEnabled])

    return (
        <>
            <BaseSafeArea />
            <BaseView align="center" justify="center">
                <BaseText>Settings Screen</BaseText>
                <BaseSpacer height={40} />

                <BaseView orientation="row">
                    <BaseText>Secure App</BaseText>
                    <Switch onValueChange={toggleSwitch} value={isEnabled} />
                </BaseView>
            </BaseView>
        </>
    )
}
