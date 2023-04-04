import { Driver, SimpleNet } from "@vechain/connex-driver"
import { newThor } from "@vechain/connex-framework/dist/thor"
import React, { useState, useEffect, useMemo, useCallback } from "react"
import { useAppSelector } from "~Storage/Redux"
import { selectSelectedNetwork } from "~Storage/Redux/Selectors"

type ConnexContextProviderProps = { children: React.ReactNode }
const ConnexContext = React.createContext<Connex.Thor | undefined>(undefined)

const ConnexContextProvider = ({ children }: ConnexContextProviderProps) => {
    const [connex, setConnex] = useState<Connex.Thor>()
    const [driver, setDriver] = useState<Driver | null>(null)
    const value = useMemo(() => (connex ? connex : undefined), [connex])

    const selectedNetwork = useAppSelector(selectSelectedNetwork)

    const initConnex = useCallback(async () => {
        if (selectedNetwork) {
            try {
                const driverInstance = await initDriver(
                    selectedNetwork.currentUrl,
                )
                const thorInstance = initThor(driverInstance)
                setDriver(driverInstance)
                setConnex(thorInstance)
            } catch (error) {
                console.log(`Error initializing Thor Driver - !! ${error} !!`)
            }
        }
    }, [selectedNetwork])

    useEffect(() => {
        if (connex?.genesis.id !== selectedNetwork?.genesis.id) {
            driver?.close()
            initConnex()
        }
    }, [initConnex, connex, selectedNetwork?.genesis, driver])

    if (!value) {
        return <></>
    }

    return (
        <ConnexContext.Provider value={value}>
            {children}
        </ConnexContext.Provider>
    )
}

const initDriver = async (url: string) => {
    return await Driver.connect(new SimpleNet(url))
}

const initThor = (currentDriver: Driver) => {
    const driver = newThor(currentDriver)
    return driver
}

const useThor = () => {
    const context = React.useContext(ConnexContext)
    if (!context) {
        throw new Error(
            "useThorContext must be used within a UserContextProvider",
        )
    }

    return context
}

export { ConnexContextProvider, useThor }
