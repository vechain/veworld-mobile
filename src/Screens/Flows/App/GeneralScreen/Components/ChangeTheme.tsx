import React, { useCallback, useMemo } from "react"
import { useColorScheme } from "~Common"
import { BaseButtonGroupHorizontal } from "~Components"
import { Button } from "~Components/Base/BaseButtonGroupHorizontal"
import { useI18nContext } from "~i18n"
import { useAppDispatch, useAppSelector } from "~Storage/Redux"
import { setTheme } from "~Storage/Redux/Actions"
import { selectIsSystemTheme, selectTheme } from "~Storage/Redux/Selectors"
import { setSystemTheme } from "~Storage/Redux/Slices/UserPreferences"

export const ChangeTheme: React.FC = () => {
    const dispatch = useAppDispatch()

    const themePref = useAppSelector(selectTheme)
    const isSystemThemePref = useAppSelector(selectIsSystemTheme)

    const activeButtonId = useMemo(
        () => (isSystemThemePref ? "system" : themePref),
        [isSystemThemePref, themePref],
    )

    //Check system color scheme
    const systemColorScheme = useColorScheme()

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
            if (button.id === "system") {
                dispatch(setSystemTheme(true))
                dispatch(setTheme(systemColorScheme))
            } else {
                dispatch(setSystemTheme(false))
                dispatch(setTheme(button.id as "light" | "dark"))
            }
        },
        [dispatch, systemColorScheme],
    )

    return (
        <BaseButtonGroupHorizontal
            selectedButtonIds={[activeButtonId]}
            buttons={themes}
            action={handleSelectTheme}
        />
    )
}
