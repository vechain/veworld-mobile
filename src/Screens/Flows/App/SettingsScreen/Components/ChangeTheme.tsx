import React, { useCallback, useMemo, useState } from "react"
import { Switch } from "react-native"
import { useUserPreferencesEntity } from "~Common/Hooks/Entities"
import { BaseText, BaseView } from "~Components"
import { useRealm } from "~Storage"

export const ChangeTheme = () => {
    const { store } = useRealm()

    const userPreferences = useUserPreferencesEntity()

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
