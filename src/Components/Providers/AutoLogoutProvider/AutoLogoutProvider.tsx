import React, { useEffect } from "react"
import { debug } from "~Utils"
import * as BackgroundFetch from "expo-background-fetch"
import * as TaskManager from "expo-task-manager"
import GlobalEventEmitter, { LOCK_APP_EVENT } from "~Events/GlobalEventEmitter"

type ProviderProps = { children: React.ReactNode }

const AUTO_LOGOUT_TASK = "AUTO_LOGOUT_TASK"

// Register auto logout task.
TaskManager.defineTask(AUTO_LOGOUT_TASK, () => {
    debug("Triggering lock app event")
    GlobalEventEmitter.emit(LOCK_APP_EVENT)
    return BackgroundFetch.BackgroundFetchResult.NewData
})

const AutoLogoutContext = React.createContext(null)

export const AutoLogoutProvider = ({ children }: ProviderProps) => {
    // Function to configure BackgroundFetch
    const configureBackgroundFetch = async () => {
        await stopBackgroundFetch()
        debug("Starting auto logout listener")
        await BackgroundFetch.registerTaskAsync(AUTO_LOGOUT_TASK, {})
    }

    const stopBackgroundFetch = async () => {
        const isRegistered = await TaskManager.isTaskRegisteredAsync(
            AUTO_LOGOUT_TASK,
        )
        if (isRegistered) {
            debug("Stopping auto logout listener")
            await BackgroundFetch.unregisterTaskAsync(AUTO_LOGOUT_TASK)
        }
    }
    useEffect(() => {
        configureBackgroundFetch()
        return () => {
            stopBackgroundFetch()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <AutoLogoutContext.Provider value={null}>
            {children}
        </AutoLogoutContext.Provider>
    )
}
