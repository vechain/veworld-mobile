import React, { useCallback, useMemo, useState } from "react"
import { useColorScheme } from "~Common"
import { BaseButtonGroupHorizontal } from "~Components"
import { Button } from "~Components/Base/BaseButtonGroupHorizontal"
import { useRealm, getUserPreferences } from "~Storage"

const currencies: Array<Button> = [
    {
        id: "light",
        label: "Light",
    },
    {
        id: "dark",
        label: "Dark",
    },
    {
        id: "system",
        label: "System",
    },
]

export const ChangeTheme: React.FC = () => {
    const { store } = useRealm()

    const userPref = getUserPreferences(store)

    const themePref = useMemo(() => userPref?.theme, [userPref])

    const [selectedTheme, setSelectedTheme] = useState(themePref)

    //Check system color scheme
    const systemColorScheme = useColorScheme()

    const handleSelectTheme = useCallback(
        (button: Button) => {
            const mode =
                button.id === "dark"
                    ? "dark"
                    : button.id === "light"
                    ? "light"
                    : systemColorScheme

            setSelectedTheme(mode)

            store.write(() => {
                if (userPref) {
                    userPref.theme = mode
                }
            })
        },
        [store, systemColorScheme, userPref],
    )

    return (
        <BaseButtonGroupHorizontal
            selectedButtonIds={[selectedTheme || ""]}
            buttons={currencies}
            action={handleSelectTheme}
        />
    )
}
