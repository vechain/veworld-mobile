import React, { useEffect } from "react"
import { debug } from "~Utils"
import * as BackgroundFetch from "expo-background-fetch"
import * as TaskManager from "expo-task-manager"
import { useAppStateTransitions } from "~Hooks"
import { setIsAppLoading, useAppDispatch } from "~Storage/Redux"
import GlobalEventEmitter, { LOCK_APP_EVENT } from "~Events/GlobalEventEmitter"

type ProviderProps = { children: React.ReactNode }

const BACKGROUND_FETCH_TASK = "background-fetch"

// 1. Define the task by providing a name and the function that should be executed
// Note: This needs to be called in the global scope (e.g outside of your React components)
TaskManager.defineTask(BACKGROUND_FETCH_TASK, () => {
    debug("Lock app event triggered")
    GlobalEventEmitter.emit(LOCK_APP_EVENT)
    return BackgroundFetch.BackgroundFetchResult.NewData
})

const AutoLogoutContext = React.createContext(null)

export const AutoLogoutProvider = ({ children }: ProviderProps) => {
    const dispatch = useAppDispatch()
    const { activeToBackground, backgroundToActive } = useAppStateTransitions()

    // Function to configure BackgroundFetch
    const configureBackgroundFetch = async () => {
        debug("Starting lock app listener")
        await BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
            minimumInterval: 60 * 1, // 15 minutes
            stopOnTerminate: false, // android only,
            startOnBoot: true, // android only
        })
    }

    const stopBackgroundFetch = () => {
        debug("Stopping lock app listener")
        BackgroundFetch.unregisterTaskAsync(BACKGROUND_FETCH_TASK)
    }

    useEffect(() => {
        if (activeToBackground) {
            dispatch(setIsAppLoading(true))
            configureBackgroundFetch()
        } else if (backgroundToActive) {
            dispatch(setIsAppLoading(false))
            stopBackgroundFetch()
        }
    }, [dispatch, activeToBackground, backgroundToActive])

    return (
        <AutoLogoutContext.Provider value={null}>
            {children}
        </AutoLogoutContext.Provider>
    )
}
