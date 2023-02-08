import React, { useEffect, useMemo, useState } from "react"
import { Switch } from "react-native"
import { BaseSafeArea, BaseSpacer, BaseText, BaseView } from "~Components"
import { Config, useStore, useStoreQuery } from "~Storage"

export const SettingsScreen = () => {
    const store = useStore()
    // todo: this is a workaround until the new version is installed
    const result = useStoreQuery(Config)
    const config = useMemo(() => result.sorted("_id"), [result])

    const [isEnabled, setIsEnabled] = useState(config[0].isAppLockActive)
    const toggleSwitch = () => setIsEnabled(previousState => !previousState)

    useEffect(() => {
        store.write(() => {
            config[0].isAppLockActive = isEnabled
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isEnabled])

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
