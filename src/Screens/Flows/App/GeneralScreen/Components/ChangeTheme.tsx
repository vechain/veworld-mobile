import React, { useCallback, useMemo, useState } from "react"
import { useColorScheme } from "~Common"
import { BaseButtonGroupHorizontal } from "~Components"
import { Button } from "~Components/Base/BaseButtonGroupHorizontal"
import { useI18nContext } from "~i18n"
import { useRealm, getUserPreferences } from "~Storage"

export const ChangeTheme: React.FC = () => {
    const { store } = useRealm()

    const userPref = getUserPreferences(store)

    //Check system color scheme
    const systemColorScheme = useColorScheme()

    const themePref: string = useMemo(() => userPref?.theme, [userPref])

    const [selectedTheme, setSelectedTheme] = useState(themePref)

    const { LL } = useI18nContext()

    const themes: Array<Button> = useMemo(() => {
        return [
            {
                id: "light",
                label: LL.LIGHT_THEME(),
            },
            {
                id: "dark",
                label: LL.DARK_THEME(),
            },
            {
                id: "system",
                label: LL.SYSTEM_THEME(),
            },
        ]
    }, [LL])

    const handleSelectTheme = useCallback(
        (button: Button) => {
            let mode: "dark" | "light"
            if (button.id === "system") mode = systemColorScheme
            else mode = button.id === "light" ? "light" : "dark"

            store.write(() => {
                if (userPref) {
                    userPref.theme = mode
                }
            })

            setSelectedTheme(button.id)
        },
        [store, systemColorScheme, userPref],
    )

    return (
        <BaseButtonGroupHorizontal
            selectedButtonIds={[selectedTheme || ""]}
            buttons={themes}
            action={handleSelectTheme}
        />
    )
}
