import React from "react"
import { AppLock } from "../Model"

import { useObjectListener } from "../useObjectListener"
import { useRealm } from "./RealmContext"

type State = AppLock

type AppLockContextProviderProps = { children: React.ReactNode }

const AppLockContext = React.createContext<State | undefined>(undefined)

/**
 * Context that expose the appLock object directly from the realm cache. Avoid redundant listeners
 */
const AppLockContextProvider = ({ children }: AppLockContextProviderProps) => {
    const { cache } = useRealm()

    const appLock = useObjectListener(
        AppLock.getName(),
        AppLock.PrimaryKey(),
        cache,
    ) as AppLock

    return (
        <AppLockContext.Provider value={appLock}>
            {children}
        </AppLockContext.Provider>
    )
}

const useAppLock = () => {
    const context = React.useContext(AppLockContext)
    if (!context) {
        throw new Error(
            "useAppLockContext must be used within a AppLockContextProvider",
        )
    }

    return context
}

export { AppLockContextProvider, useAppLock }
