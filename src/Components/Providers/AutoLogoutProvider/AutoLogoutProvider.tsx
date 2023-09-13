import React, { useEffect } from "react"
import { debug } from "~Utils"
import * as BackgroundFetch from "expo-background-fetch"
import * as TaskManager from "expo-task-manager"
import { useAppStateTransitions } from "~Hooks"
import { setIsAppLoading, useAppDispatch } from "~Storage/Redux"
import { AUTO_LOGOUT_TASK } from "./constants"

type ProviderProps = { children: React.ReactNode }

const AutoLogoutContext = React.createContext(null)

export const AutoLogoutProvider = ({ children }: ProviderProps) => {
    const dispatch = useAppDispatch()
    const { activeToBackground, backgroundToActive } = useAppStateTransitions()

    const checkStatusAsync = async () => {
        const status = await BackgroundFetch.getStatusAsync()
        const isRegistered = await TaskManager.isTaskRegisteredAsync(
            AUTO_LOGOUT_TASK,
        )
        debug(
            `Auto logout status: ${
                status === 3 ? "AVAILABLE" : "NOT_AVAIlABLE"
            }, isRegistered: ${isRegistered}`,
        )
    }

    // Function to configure BackgroundFetch
    const configureBackgroundFetch = async () => {
        debug("Starting auto logout listener")
        await BackgroundFetch.registerTaskAsync(AUTO_LOGOUT_TASK, {
            minimumInterval: 60 * 1, // 15 minutes
        })
        checkStatusAsync()
    }

    const stopBackgroundFetch = () => {
        debug("Stopping auto logout listener")
        BackgroundFetch.unregisterTaskAsync(AUTO_LOGOUT_TASK)
        checkStatusAsync()
    }
    useEffect(() => {
        if (activeToBackground) {
            dispatch(setIsAppLoading(true))
            configureBackgroundFetch()
        } else if (backgroundToActive) {
            dispatch(setIsAppLoading(false))
            stopBackgroundFetch()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch, activeToBackground, backgroundToActive])

    return (
        <AutoLogoutContext.Provider value={null}>
            {children}
        </AutoLogoutContext.Provider>
    )
}
