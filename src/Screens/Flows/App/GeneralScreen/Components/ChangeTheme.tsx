import React, { useCallback, useMemo } from "react"
import { ThemeEnum } from "~Common/Enums"
import { BaseButtonGroupHorizontal } from "~Components"
import { Button } from "~Components/Base/BaseButtonGroupHorizontal"
import { useI18nContext } from "~i18n"
import { useAppDispatch, useAppSelector } from "~Storage/Redux"
import { setTheme } from "~Storage/Redux/Actions"
import { selectTheme } from "~Storage/Redux/Selectors"

export const ChangeTheme: React.FC = () => {
    const dispatch = useAppDispatch()

    const selectedTheme = useAppSelector(selectTheme)

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
            let mode: ThemeEnum
            switch (button.id) {
                case "system":
                    mode = ThemeEnum.SYSTEM
                    break
                case "light":
                    mode = ThemeEnum.LIGHT
                    break
                case "dark":
                    mode = ThemeEnum.DARK
                    break
                default:
                    mode = ThemeEnum.SYSTEM
                    break
            }

            dispatch(setTheme(mode))
        },
        [dispatch],
    )

    return (
        <BaseButtonGroupHorizontal
            selectedButtonIds={[selectedTheme || ""]}
            buttons={themes}
            action={handleSelectTheme}
        />
    )
}
