import React, { useCallback, useMemo } from "react"
import { ThemeEnum, useColorScheme } from "~Common"
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
                id: ThemeEnum.LIGHT,
                label: LL.LIGHT_THEME(),
            },
            {
                id: ThemeEnum.DARK,
                label: LL.DARK_THEME(),
            },
            {
                id: ThemeEnum.SYSTEM,
                label: LL.SYSTEM_THEME(),
            },
        ]
    }, [LL])

    const handleSelectTheme = useCallback(
        (button: Button) => {
            if (button.id === ThemeEnum.SYSTEM) {
                dispatch(setSystemTheme(true))
                dispatch(setTheme(systemColorScheme as ThemeEnum))
            } else {
                dispatch(setSystemTheme(false))
                dispatch(setTheme(button.id as ThemeEnum))
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
