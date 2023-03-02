import { useObjectListener, useRealm, UserPreferences } from "~Storage"

export const useUserPreferencesEntity = () => {
    const { store } = useRealm()

    const userPreferencesEntity = useObjectListener(
        UserPreferences.getName(),
        UserPreferences.getPrimaryKey(),
        store,
    ) as UserPreferences

    return userPreferencesEntity
}
