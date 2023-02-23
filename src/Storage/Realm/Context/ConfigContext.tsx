import React from "react"
import { Config } from "../Model"

import { useObjectListener } from "../useObjectListener"
import { useRealm } from "./RealmContext"

type State = Config

type ConfigContextProviderProps = { children: React.ReactNode }

const ConfigContext = React.createContext<State | undefined>(undefined)

/**
 * Context that expose the config object directly from the realm cache. Avoid redundant listeners
 */
const ConfigContextProvider = ({ children }: ConfigContextProviderProps) => {
    const { store } = useRealm()

    const config = useObjectListener(
        Config.getName(),
        Config.PrimaryKey(),
        store,
    ) as Config

    return (
        <ConfigContext.Provider value={config}>
            {children}
        </ConfigContext.Provider>
    )
}

const useConfig = () => {
    const context = React.useContext(ConfigContext)
    if (!context) {
        throw new Error(
            "useConfigContext must be used within a ConfigContextProvider",
        )
    }

    return context
}

export { ConfigContextProvider, useConfig }
