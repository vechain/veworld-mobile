import React, { useCallback, useMemo, useState } from "react"
import { useColorScheme } from "~Common"
import { BaseButtonGroupHorizontal } from "~Components"
import { Button } from "~Components/Base/BaseButtonGroupHorizontal"
import { useI18nContext } from "~i18n"
import { useAppDispatch, useAppSelector } from "~Storage/Redux"
import { setTheme } from "~Storage/Redux/Actions"
import { selectTheme } from "~Storage/Redux/Selectors"

export const ChangeTheme: React.FC = () => {
    const dispatch = useAppDispatch()

    const themePref: string = useAppSelector(selectTheme)

    //Check system color scheme
    const systemColorScheme = useColorScheme()

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

            dispatch(setTheme(mode))

            setSelectedTheme(button.id)
        },
        [dispatch, systemColorScheme],
    )

    return (
        <BaseButtonGroupHorizontal
            selectedButtonIds={[selectedTheme || ""]}
            buttons={themes}
            action={handleSelectTheme}
        />
    )
}
