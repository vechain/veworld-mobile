import React, { useCallback, useEffect } from "react"
import { error, debug } from "~Utils"
import * as BackgroundFetch from "expo-background-fetch"
import * as TaskManager from "expo-task-manager"
import { useApplicationSecurity } from "../EncryptedStorageProvider"

type ProviderProps = { children: React.ReactNode }

const AUTO_LOCK_TASK = "AUTO_LOCK_TASK"

const AutoLockContext = React.createContext(null)

export const AutoLockProvider = ({ children }: ProviderProps) => {
    const { setTriggerAutoLock } = useApplicationSecurity()

    const registerAutoLockTask = useCallback(() => {
        if (setTriggerAutoLock) {
            debug("Registering auto lock task")
            // Register auto lock task.
            TaskManager.defineTask(AUTO_LOCK_TASK, () => {
                try {
                    debug("Trigging auto lock")
                    setTriggerAutoLock(true)
                    return BackgroundFetch.BackgroundFetchResult.NewData
                } catch (err) {
                    error("Error registering auto lock task", err)
                    return BackgroundFetch.BackgroundFetchResult.Failed
                }
            })
        }
    }, [setTriggerAutoLock])

    // Function to configure BackgroundFetch
    const configureBackgroundFetch = async () => {
        try {
            await stopBackgroundFetch()
            debug("Starting auto lock listener")
            await BackgroundFetch.registerTaskAsync(AUTO_LOCK_TASK, {
                minimumInterval: 600,
                stopOnTerminate: false,
                startOnBoot: true,
            })
        } catch (err) {
            error("Error registering auto lock task", err)
        }
    }

    const stopBackgroundFetch = async () => {
        const isRegistered = await TaskManager.isTaskRegisteredAsync(
            AUTO_LOCK_TASK,
        )
        if (isRegistered) {
            debug("Stopping auto lock listener")
            await BackgroundFetch.unregisterTaskAsync(AUTO_LOCK_TASK)
        }
    }
    useEffect(() => {
        registerAutoLockTask()
    }, [registerAutoLockTask])

    useEffect(() => {
        configureBackgroundFetch()
        return () => {
            stopBackgroundFetch()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <AutoLockContext.Provider value={null}>
            {children}
        </AutoLockContext.Provider>
    )
}
