import React, { useCallback, useMemo } from "react"
import { ThemeEnum } from "~Constants"
import { BaseButtonGroupHorizontal, usePersistedTheme } from "~Components"
import { useI18nContext } from "~i18n"
import { BaseButtonGroupHorizontalType } from "~Model"

export const ChangeTheme: React.FC = () => {
    const { theme: themePref, changeTheme } = usePersistedTheme()

    const { LL } = useI18nContext()

    const themes: Array<BaseButtonGroupHorizontalType> = useMemo(() => {
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
        (button: BaseButtonGroupHorizontalType) => {
            let mode: ThemeEnum
            switch (button.id) {
                case "light":
                    mode = ThemeEnum.LIGHT
                    break
                case "dark":
                    mode = ThemeEnum.DARK
                    break
                case "system":
                    mode = ThemeEnum.SYSTEM
                    break
                default:
                    mode = ThemeEnum.SYSTEM
                    break
            }

            changeTheme(mode)
        },
        [changeTheme],
    )

    return (
        <BaseButtonGroupHorizontal
            selectedButtonIds={[themePref]}
            buttons={themes}
            action={handleSelectTheme}
        />
    )
}
