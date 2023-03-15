import React, { useCallback, useMemo, useState } from "react"
import { Switch } from "react-native"
import { BaseText, BaseView } from "~Components"
import { useRealm, getUserPreferences } from "~Storage"

export const ChangeTheme = () => {
    const { store } = useRealm()

    const userPref = getUserPreferences(store)

    const isRealmDark = useMemo(() => userPref?.theme === "dark", [userPref])
    const [isDark, setIsDark] = useState(isRealmDark)

    const toggleSwitch = useCallback(
        (newValue: boolean) => {
            const mode = newValue ? "dark" : "light"
            setIsDark(newValue)
            store.write(() => {
                if (userPref) {
                    userPref.theme = mode
                }
            })
        },
        [store, userPref],
    )

    return (
        <BaseView
            justify="space-between"
            w={100}
            align="center"
            orientation="row">
            <BaseText>Dark Mode</BaseText>
            <Switch onValueChange={toggleSwitch} value={isDark} />
        </BaseView>
    )
}
