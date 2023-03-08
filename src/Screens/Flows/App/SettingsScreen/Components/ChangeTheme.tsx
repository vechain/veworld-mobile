import React, { useCallback, useMemo, useState } from "react"
import { Switch } from "react-native"
import { BaseText, BaseView } from "~Components"
import { UserPreferences, useRealm } from "~Storage"

export const ChangeTheme = () => {
    const { store } = useRealm()

    const userPreferences = store.objectForPrimaryKey<UserPreferences>(
        UserPreferences.getName(),
        UserPreferences.getPrimaryKey(),
    )

    const isRealmDark = useMemo(
        () => userPreferences?.theme === "dark",
        [userPreferences],
    )

    const [isDark, setIsDark] = useState(isRealmDark)

    const toggleSwitch = useCallback(
        (newValue: boolean) => {
            const mode = newValue ? "dark" : "light"
            setIsDark(newValue)
            store.write(() => {
                if (userPreferences) {
                    userPreferences.theme = mode
                }
            })
        },
        [store, userPreferences],
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
