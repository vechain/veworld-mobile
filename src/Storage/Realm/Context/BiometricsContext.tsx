import React from "react"
import { Biometrics } from "../Model"

import { useObjectListener } from "../useObjectListener"
import { useRealm } from "./RealmContext"

type State = Biometrics

type BiometricsContextProviderProps = { children: React.ReactNode }

const BiometricsContext = React.createContext<State | undefined>(undefined)

/**
 * Context that expose the config object directly from the realm cache. Avoid redundant listeners
 */
const BiometricsContextProvider = ({
    children,
}: BiometricsContextProviderProps) => {
    const { cache } = useRealm()

    const biometrics = useObjectListener(
        Biometrics.getName(),
        Biometrics.PrimaryKey(),
        cache,
    ) as Biometrics

    return (
        <BiometricsContext.Provider value={biometrics}>
            {children}
        </BiometricsContext.Provider>
    )
}

const useBiometrics = () => {
    const context = React.useContext(BiometricsContext)
    if (!context) {
        throw new Error(
            "useBiometricsContext must be used within a BiometricsContextProvider",
        )
    }

    return context
}

export { BiometricsContextProvider, useBiometrics }
