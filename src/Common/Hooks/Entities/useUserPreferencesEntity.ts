import { useMemo } from "react"
import { useObjectListener, useRealm, UserPreferences } from "~Storage"

export const useUserPreferencesEntity = () => {
    const { store } = useRealm()

    const userPreferencesEntity = useObjectListener(
        UserPreferences.getName(),
        UserPreferences.getPrimaryKey(),
        store,
    ) as UserPreferences

    const currentNetwork = useMemo(
        () => userPreferencesEntity?.currentNetwork,
        [userPreferencesEntity?.currentNetwork],
    )

    const isAppLockActive = useMemo(
        () => userPreferencesEntity?.isAppLockActive,
        [userPreferencesEntity?.isAppLockActive],
    )

    const theme = useMemo(
        () => userPreferencesEntity?.theme,
        [userPreferencesEntity?.theme],
    )

    return { isAppLockActive, currentNetwork, theme }
}
