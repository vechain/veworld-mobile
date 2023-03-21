import React from "react"
import { UserPreferences, useObjectListener, useRealm } from "~Storage"

type UserPreferencesContextProviderProps = { children: React.ReactNode }
const UserPreferencesContext = React.createContext<UserPreferences | null>(null)

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
        <UserPreferencesContext.Provider value={userPref}>
            {children}
        </UserPreferencesContext.Provider>
    )
}

const useUserPreferencesEntity = () => {
    const context = React.useContext(UserPreferencesContext)
    if (!context) {
        throw new Error(
            "useUserPreferencesContext must be used within a UserPreferencesContextProvider",
        )
    }

    return context
}

export { UserPreferencesContextProvider, useUserPreferencesEntity }
