import React, { useEffect, useState } from "react"
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

// Module-level ref so the background task can access the latest callback
let triggerAutoLockRef: (() => void) | null = null

// defineTask must be called at module scope per Expo's requirements
TaskManager.defineTask(AUTO_LOCK_TASK, async () => {
    try {
        debug(ERROR_EVENTS.SECURITY, "Trigging auto lock")
        triggerAutoLockRef?.()
        return BackgroundFetch.BackgroundFetchResult.NewData
    } catch (err) {
        error(ERROR_EVENTS.SECURITY, err)
        return BackgroundFetch.BackgroundFetchResult.Failed
    }
})

const AutoLockContext = React.createContext(null)

export const AutoLockProvider = ({ children }: ProviderProps) => {
    const { triggerAutoLock, lockApplication } = useApplicationSecurity()
    const dispatch = useAppDispatch()
    const { activeToBackground, backgroundToActive } = useAppStateTransitions()
    const [inactivityStartTime, setInactivityStartTime] = useState<number>(0)

    // Function to configure BackgroundFetch
    const configureBackgroundFetch = async () => {
        try {
            debug(ERROR_EVENTS.SECURITY, "Starting auto lock listener")
            await BackgroundFetch.registerTaskAsync(AUTO_LOCK_TASK, {
                minimumInterval: 600,
                stopOnTerminate: false,
                startOnBoot: true,
            })
        } catch (err) {
            error(ERROR_EVENTS.SECURITY, err)
        }
    }

    useEffect(() => {
        triggerAutoLockRef = triggerAutoLock
    }, [triggerAutoLock])

    useEffect(() => {
        configureBackgroundFetch()
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
                    info(ERROR_EVENTS.SECURITY, "App was inactive for more than 5 minutes. Locking...")
                    lockApplication()
                }
            } catch (err) {
                error(ERROR_EVENTS.SECURITY, "Error checking inactivity time", err)
            } finally {
                dispatch(setIsAppLoading(false))
                setInactivityStartTime(0)
            }
        }
    }, [dispatch, activeToBackground, backgroundToActive, inactivityStartTime, lockApplication])

    return <AutoLockContext.Provider value={null}>{children}</AutoLockContext.Provider>
}
