import { Driver } from "@vechain/connex-driver"
import { newThor } from "@vechain/connex-framework/dist/thor"
import React, { useEffect, useMemo, useRef, useState } from "react"
import { useAppSelector } from "~Storage/Redux"
import { selectSelectedNetwork } from "~Storage/Redux/Selectors"
import { CustomNet } from "~Components/Providers/ConnexProvider/CustomNet"
import { Network } from "~Model"

type ConnexContextProviderProps = { children: React.ReactNode }
const ConnexContext = React.createContext<Connex.Thor | undefined>(undefined)

const ConnexContextProvider = ({ children }: ConnexContextProviderProps) => {
    const selectedNetwork = useAppSelector(selectSelectedNetwork)
    const driver = useRef<Driver>(createDriver(selectedNetwork))
    const thor = useMemo(() => {
        if (driver.current.genesis.id !== selectedNetwork.genesis.id) {
            driver.current.close()
            driver.current = createDriver(selectedNetwork)
        }

        return newThor(driver.current)
    }, [selectedNetwork])
    const [status, setStatus] = useState<Connex.Thor.Status>(thor.status)

    useEffect(() => {
        const interval = setInterval(() => {
            if (thor.status.head !== status.head) {
                setStatus(thor.status)
            }
        }, 200)

        return () => clearInterval(interval)
    }, [thor, status])

    const value = useMemo(() => {
        return {
            ...thor,
            status,
        }
    }, [thor, status])

    return (
        <ConnexContext.Provider value={value}>
            {children}
        </ConnexContext.Provider>
    )
}

const createDriver = (network: Network) =>
    new Driver(new CustomNet(network.currentUrl), network.genesis)

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
