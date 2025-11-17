import React, { useCallback, useMemo } from "react"
import { usePersistedTheme } from "~Components"
import { BaseTabs } from "~Components/Base/BaseTabs"
import { ThemeEnum } from "~Constants"
import { useI18nContext } from "~i18n"

export const ChangeTheme: React.FC = () => {
    const { theme: themePref, changeTheme } = usePersistedTheme()

    const { LL } = useI18nContext()

    const themes: Array<string> = useMemo(() => {
        return [ThemeEnum.LIGHT, ThemeEnum.DARK, ThemeEnum.SYSTEM]
    }, [])

    const labels = useMemo(() => [LL.LIGHT_THEME(), LL.DARK_THEME(), LL.SYSTEM_THEME()], [LL])

    const handleSelectTheme = useCallback(
        (themeKey: string) => {
            let mode: ThemeEnum
            switch (themeKey) {
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

    return <BaseTabs keys={themes} labels={labels} selectedKey={themePref} setSelectedKey={handleSelectTheme} />
}
