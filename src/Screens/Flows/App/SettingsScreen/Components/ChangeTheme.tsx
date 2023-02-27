import React, { useCallback, useMemo } from "react"
import { Switch } from "react-native"
import { BaseText, BaseView } from "~Components"
import { useRealm, useObjectListener, UserPreferences } from "~Storage"

export const ChangeTheme = () => {
    const { store } = useRealm()

    const userPreferences = useObjectListener(
        UserPreferences.getName(),
        UserPreferences.getPrimaryKey(),
        store,
    ) as UserPreferences

    const isDark = useMemo(
        () => userPreferences?.theme === "dark",
        [userPreferences],
    )

    console.log({ isDark })

    const toggleSwitch = useCallback(
        (newValue: boolean) => {
            console.log({ newValue })
            const mode = newValue ? "dark" : "light"
            store.write(() => {
                if (userPreferences) {
                    userPreferences.theme = mode
                    console.log({ userPreferences })
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
