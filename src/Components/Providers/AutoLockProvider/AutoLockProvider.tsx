import React, { useCallback, useEffect, useState } from "react"
import { error, debug, info } from "~Utils"
import * as BackgroundFetch from "expo-background-fetch"
import * as TaskManager from "expo-task-manager"
import { useApplicationSecurity } from "../EncryptedStorageProvider"
import { setIsAppLoading, useAppDispatch } from "~Storage/Redux"
import { useAppStateTransitions } from "~Hooks"

type ProviderProps = { children: React.ReactNode }

const AUTO_LOCK_TASK = "AUTO_LOCK_TASK"
const FIVE_MINUTES = 5 * 60 * 1000

const AutoLockContext = React.createContext(null)

export const AutoLockProvider = ({ children }: ProviderProps) => {
    const { setTriggerAutoLock } = useApplicationSecurity()
    const dispatch = useAppDispatch()
    const { activeToBackground, backgroundToActive } = useAppStateTransitions()
    const [inactivityStartTime, setInactivityStartTime] = useState<number>(0)

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

    useEffect(() => {
        if (inactivityStartTime === 0 && activeToBackground) {
            dispatch(setIsAppLoading(true))
            setInactivityStartTime(Date.now())
        } else if (inactivityStartTime > 0 && backgroundToActive) {
            try {
                // Check if the app was closed for more than 5 minutes
                const now = Date.now()

                if (
                    inactivityStartTime > 0 &&
                    now - inactivityStartTime > FIVE_MINUTES
                ) {
                    info("App was inactive for more than 5 minutes. Locking...")
                    setTriggerAutoLock(true)
                }
            } catch (err) {
                error("Error checking inactivity time", err)
            } finally {
                dispatch(setIsAppLoading(false))
                setInactivityStartTime(0)
            }
        }
    }, [
        dispatch,
        activeToBackground,
        backgroundToActive,
        inactivityStartTime,
        setTriggerAutoLock,
    ])

    return (
        <AutoLockContext.Provider value={null}>
            {children}
        </AutoLockContext.Provider>
    )
}
