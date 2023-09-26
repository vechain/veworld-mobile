import React, { useEffect } from "react"
import { debug, warn } from "~Utils"
import BackgroundFetch from "react-native-background-fetch"
import { useApplicationSecurity } from "../EncryptedStorageProvider"

type ProviderProps = { children: React.ReactNode }

const AutoLogoutContext = React.createContext(null)

export const AutoLogoutProvider = ({ children }: ProviderProps) => {
    const { setTriggerAutoLock } = useApplicationSecurity()

    const onEvent = (taskId: string) => {
        debug(`[BackgroundFetch] task: ${taskId} triggered ${Date()}`)
        setTriggerAutoLock(true)
        BackgroundFetch.finish(taskId)
    }

    const onTimeout = (taskId: string) => {
        warn(`[BackgroundFetch] TIMEOUT task: ${taskId}`)
        BackgroundFetch.finish(taskId)
    }

    const initBackgroundFetch = async () => {
        // Initialize BackgroundFetch only once when component mounts.
        const status = await BackgroundFetch.configure(
            { minimumFetchInterval: 15 },
            onEvent,
            onTimeout,
        )

        debug(`[BackgroundFetch] configure status: ${status}`)
    }

    useEffect(() => {
        initBackgroundFetch()
        return () => {
            initBackgroundFetch()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <AutoLogoutContext.Provider value={null}>
            {children}
        </AutoLogoutContext.Provider>
    )
}
