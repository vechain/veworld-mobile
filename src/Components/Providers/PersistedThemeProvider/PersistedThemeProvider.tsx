import React, { useCallback, useEffect, useMemo, useState } from "react"
import { ThemeEnum } from "~Constants"
import { initEncryption } from "~Services/EncryptionService"
import { CACHE_THEME_KEY, SecurePersistedCache } from "~Storage/PersistedCache"
import { SynchronousCache } from "~Storage/PersistedCache/interface"

const THEME_MODE_ACCESS_KEY = "VeWorld_Theme_Mode_key"

type ThemeProvider = {
    themeCache: SynchronousCache<ThemeEnum>
    theme: ThemeEnum
    initThemeCache: () => Promise<void>
    resetThemeCache: () => Promise<void>
    changeTheme: (theme: ThemeEnum) => Promise<void>
}

const ThemeContext = React.createContext<ThemeProvider | undefined>(undefined)

type ThemeProviderProps = { children: React.ReactNode }

const PersistedThemeProvider = ({ children }: ThemeProviderProps) => {
    const [themeCache, setThemeCache] = useState<SynchronousCache<ThemeEnum>>()
    const [theme, setTheme] = useState<ThemeEnum>()

    const initThemeCache = useCallback(async () => {
        setThemeCache(
            new SecurePersistedCache<ThemeEnum>(
                CACHE_THEME_KEY,
                await initEncryption(CACHE_THEME_KEY),
            ),
        )
    }, [])

    const reset = useCallback(async () => {
        themeCache?.reset()
    }, [themeCache])

    const changeTheme = useCallback(
        async (newTheme: ThemeEnum) => {
            themeCache?.setItem(THEME_MODE_ACCESS_KEY, newTheme)

            setTheme(newTheme)
        },
        [setTheme, themeCache],
    )

    useEffect(() => {
        initThemeCache()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    /**
     * Set the theme if not already set
     */
    useEffect(() => {
        const storedTheme = themeCache?.getItem(THEME_MODE_ACCESS_KEY)

        if (!storedTheme) {
            setTheme(ThemeEnum.SYSTEM)
            themeCache?.setItem(THEME_MODE_ACCESS_KEY, ThemeEnum.SYSTEM)

            return
        }

        setTheme(storedTheme)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [themeCache])

    const value = useMemo(() => {
        if (themeCache && theme)
            return {
                themeCache,
                theme,
                initThemeCache,
                resetThemeCache: reset,
                changeTheme,
            }

        return undefined
    }, [themeCache, theme, initThemeCache, reset, changeTheme])

    if (!value) {
        return <></>
    }

    return (
        <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
    )
}

const usePersistedTheme = () => {
    const context = React.useContext(ThemeContext)
    if (!context) {
        throw new Error(
            "usePersistedTheme must be used within a PersistedThemeProvider",
        )
    }

    return context
}

export { usePersistedTheme, PersistedThemeProvider }
