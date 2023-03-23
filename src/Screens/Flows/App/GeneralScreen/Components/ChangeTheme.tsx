import React, { useCallback, useMemo, useState } from "react"
import { BaseSwitch, BaseText, BaseView } from "~Components"
import { useRealm, getUserPreferences } from "~Storage"
import { useAppDispatch } from "~Storage/Redux"
import { setTheme } from "~Storage/Redux/Actions"

export const ChangeTheme = () => {
    const { store } = useRealm()

    const userPref = getUserPreferences(store)

    const isRealmDark = useMemo(() => userPref?.theme === "dark", [userPref])
    const [isDark, setIsDark] = useState(isRealmDark)

    const dispatch = useAppDispatch()

    const toggleSwitch = useCallback(
        (newValue: boolean) => {
            const mode = newValue ? "dark" : "light"
            setIsDark(newValue)

            dispatch(setTheme(mode))

            store.write(() => {
                if (userPref) {
                    userPref.theme = mode
                }
            })
        },
        [dispatch, store, userPref],
    )

    return (
        <BaseView
            justifyContent="space-between"
            w={100}
            alignItems="center"
            flexDirection="row">
            <BaseText>Dark Mode</BaseText>
            <BaseSwitch onValueChange={toggleSwitch} value={isDark} />
        </BaseView>
    )
}
