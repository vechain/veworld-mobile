import React from "react"
import { UserPreferences, useObjectListener, useRealm } from "~Storage"

type UserPreferencesContextProviderProps = { children: React.ReactNode }
const UserPreferencesConext = React.createContext<UserPreferences | null>(null)

const UserPreferencesContextProvider = ({
    children,
}: UserPreferencesContextProviderProps) => {
    const { store } = useRealm()

    const userPref = useObjectListener(
        UserPreferences.getName(),
        UserPreferences.getPrimaryKey(),
        store,
    ) as UserPreferences

    if (!userPref) {
        return <></>
    }

    return (
        <UserPreferencesConext.Provider value={userPref}>
            {children}
        </UserPreferencesConext.Provider>
    )
}

const useUserPreferencesEntity = () => {
    const context = React.useContext(UserPreferencesConext)
    if (!context) {
        throw new Error(
            "useUserPreferencesContext must be used within a UserContextProvider",
        )
    }

    return context
}

export { UserPreferencesContextProvider, useUserPreferencesEntity }
