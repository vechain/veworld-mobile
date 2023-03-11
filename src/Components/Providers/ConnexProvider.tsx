import { Driver, SimpleNet } from "@vechain/connex-driver"
import { newThor } from "@vechain/connex-framework/dist/thor"
import React, { useState, useEffect, useMemo, useCallback } from "react"
import { useUserPreferencesEntity } from "~Common/Hooks/Entities"

type ConnexContextProviderProps = { children: React.ReactNode }
const ConnexConext = React.createContext<Connex.Thor | undefined>(undefined)

const ConneexConextProvider = ({ children }: ConnexContextProviderProps) => {
    const [connex, setConnex] = useState<Connex.Thor>()
    const value = useMemo(() => (connex ? connex : undefined), [connex])

    const { currentNetwork } = useUserPreferencesEntity()

    const initConnex = useCallback(async () => {
        const connexInstance = await _initConnex(currentNetwork.currentUrl)
        setConnex(connexInstance)
    }, [currentNetwork.currentUrl])

    useEffect(() => {
        initConnex()
    }, [initConnex])

    if (!value) {
        return <></>
    }

    return (
        <ConnexConext.Provider value={value}>{children}</ConnexConext.Provider>
    )
}

const _initConnex = async (url: string) => {
    const currentDriver = await Driver.connect(new SimpleNet(url))
    const driver = newThor(currentDriver)
    return driver
}

const useThor = () => {
    const context = React.useContext(ConnexConext)
    if (!context) {
        throw new Error(
            "useRealmContext must be used within a UserContextProvider",
        )
    }

    return context
}

export { ConneexConextProvider, useThor }
