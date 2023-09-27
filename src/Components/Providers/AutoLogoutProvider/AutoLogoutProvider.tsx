import React, { useCallback, useEffect } from "react"
import { error, debug } from "~Utils"
import * as BackgroundFetch from "expo-background-fetch"
import * as TaskManager from "expo-task-manager"
import { useApplicationSecurity } from "../EncryptedStorageProvider"

type ProviderProps = { children: React.ReactNode }

const AUTO_LOGOUT_TASK = "AUTO_LOGOUT_TASK"

const AutoLogoutContext = React.createContext(null)

export const AutoLogoutProvider = ({ children }: ProviderProps) => {
    const { setTriggerAutoLock } = useApplicationSecurity()

    const registerAutoLogoutTask = useCallback(() => {
        if (setTriggerAutoLock) {
            debug("Registering auto logout task")
            // Register auto logout task.
            TaskManager.defineTask(AUTO_LOGOUT_TASK, () => {
                try {
                    debug("Trigging auto lock")
                    setTriggerAutoLock(true)
                    return BackgroundFetch.BackgroundFetchResult.NewData
                } catch (err) {
                    error("Error registering background task", err)
                    return BackgroundFetch.BackgroundFetchResult.Failed
                }
            })
        }
    }, [setTriggerAutoLock])

    // Function to configure BackgroundFetch
    const configureBackgroundFetch = async () => {
        try {
            await stopBackgroundFetch()
            debug("Starting auto logout listener")
            await BackgroundFetch.registerTaskAsync(AUTO_LOGOUT_TASK, {
                minimumInterval: 600,
                stopOnTerminate: false,
                startOnBoot: true,
            })
        } catch (err) {
            error("Error registering background task", err)
        }
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
        registerAutoLogoutTask()
    }, [registerAutoLogoutTask])

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
