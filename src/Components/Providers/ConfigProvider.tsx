import React from "react"
import { Config, useObjectListener, useRealm } from "~Storage"

type ConfigContextProviderProps = { children: React.ReactNode }
const ConfigConext = React.createContext<Config | null>(null)

const ConfigContextProvider = ({ children }: ConfigContextProviderProps) => {
    const { store } = useRealm()

    const config = useObjectListener(
        Config.getName(),
        Config.getPrimaryKey(),
        store,
    ) as Config

    if (!config) {
        return <></>
    }

    return (
        <ConfigConext.Provider value={config}>{children}</ConfigConext.Provider>
    )
}

const useConfigEntity = () => {
    const context = React.useContext(ConfigConext)
    if (!context) {
        throw new Error(
            "useConfigContext must be used within a UserContextProvider",
        )
    }

    return context
}

export { ConfigContextProvider, useConfigEntity }
