import React from "react"
import { Config, useObjectListener, useRealm } from "~Storage"

type ConfigContextProviderProps = { children: React.ReactNode }
const ConfigContext = React.createContext<Config | null>(null)

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
        <ConfigContext.Provider value={config}>
            {children}
        </ConfigContext.Provider>
    )
}

const useConfigEntity = () => {
    const context = React.useContext(ConfigContext)
    if (!context) {
        throw new Error(
            "useConfigContext must be used within a ConfigContextProvider",
        )
    }

    return context
}

export { ConfigContextProvider, useConfigEntity }
