import React, { useCallback, useEffect, useState } from "react"
import { error, debug, info } from "~Utils"
import * as BackgroundFetch from "expo-background-fetch"
import * as TaskManager from "expo-task-manager"
import { useApplicationSecurity } from "../EncryptedStorageProvider"
import { setIsAppLoading, useAppDispatch } from "~Storage/Redux"
import { useAppStateTransitions } from "~Hooks"
import { ERROR_EVENTS } from "~Constants"

type ProviderProps = { children: React.ReactNode }

const AUTO_LOCK_TASK = "AUTO_LOCK_TASK"
const FIVE_MINUTES = 5 * 60 * 1000

const AutoLockContext = React.createContext(null)

export const AutoLockProvider = ({ children }: ProviderProps) => {
    const { triggerAutoLock, lockApplication } = useApplicationSecurity()
    const dispatch = useAppDispatch()
    const { activeToBackground, backgroundToActive } = useAppStateTransitions()
    const [inactivityStartTime, setInactivityStartTime] = useState<number>(0)

    const registerAutoLockTask = useCallback(() => {
        if (triggerAutoLock) {
            debug(ERROR_EVENTS.SECURTIY, "Registering auto lock task")
            // Register auto lock task.
            TaskManager.defineTask(AUTO_LOCK_TASK, () => {
                try {
                    debug(ERROR_EVENTS.SECURTIY, "Trigging auto lock")
                    triggerAutoLock()
                    return BackgroundFetch.BackgroundFetchResult.NewData
                } catch (err) {
                    error(ERROR_EVENTS.SECURTIY, err)
                    return BackgroundFetch.BackgroundFetchResult.Failed
                }
            })
        }
    }, [triggerAutoLock])

    // Function to configure BackgroundFetch
    const configureBackgroundFetch = async () => {
        try {
            await stopBackgroundFetch()
            debug(ERROR_EVENTS.SECURTIY, "Starting auto lock listener")
            await BackgroundFetch.registerTaskAsync(AUTO_LOCK_TASK, {
                minimumInterval: 600,
                stopOnTerminate: false,
                startOnBoot: true,
            })
        } catch (err) {
            error(ERROR_EVENTS.SECURTIY, err)
        }
    }

    const stopBackgroundFetch = async () => {
        const isRegistered = await TaskManager.isTaskRegisteredAsync(AUTO_LOCK_TASK)
        if (isRegistered) {
            debug(ERROR_EVENTS.SECURTIY, "Stopping auto lock listener")
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

                if (inactivityStartTime > 0 && now - inactivityStartTime > FIVE_MINUTES) {
                    info(ERROR_EVENTS.SECURTIY, "App was inactive for more than 5 minutes. Locking...")
                    lockApplication()
                }
            } catch (err) {
                error(ERROR_EVENTS.SECURTIY, "Error checking inactivity time", err)
            } finally {
                dispatch(setIsAppLoading(false))
                setInactivityStartTime(0)
            }
        }
    }, [dispatch, activeToBackground, backgroundToActive, inactivityStartTime, lockApplication])

    return <AutoLockContext.Provider value={null}>{children}</AutoLockContext.Provider>
}
