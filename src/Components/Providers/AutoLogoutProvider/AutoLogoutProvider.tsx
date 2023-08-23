import React, { useEffect, useState } from "react"
import { useAppStateTransitions } from "~Hooks"
import { setIsAppLoading, useAppDispatch } from "~Storage/Redux"
import { debug } from "~Utils"

type ProviderProps = { children: React.ReactNode }

const AutoLogoutContext = React.createContext(null)

export const AutoLogoutProvider = ({ children }: ProviderProps) => {
    const dispatch = useAppDispatch()
    const { activeToBackground, backgroundToActive } = useAppStateTransitions()
    const [inactivityStartTime, setInactivityStartTime] = useState<number>(0)

    useEffect(() => {
        if (inactivityStartTime === 0 && activeToBackground) {
            debug("App went to background")
            dispatch(setIsAppLoading(true))
            setInactivityStartTime(Date.now())
        } else if (inactivityStartTime > 0 && backgroundToActive) {
            debug("App is now active")
            /**
             * note I had to comment this out because it was causing the app to crash
             * since the library we were using to restart the app was not working
             */
            // Check if the app was closed for more than 5 minutes
            // const now = Date.now()
            // const fiveMinutes = 5 * 60 * 1000
            // if (now - inactivityStartTime > fiveMinutes) {
            //     info("App was inactive for more than 5 minutes. Restarting...")
            //     restart in some way
            // } else {
            dispatch(setIsAppLoading(false))
            setInactivityStartTime(0)
            // }
        }
    }, [dispatch, activeToBackground, backgroundToActive, inactivityStartTime])

    return (
        <AutoLogoutContext.Provider value={null}>
            {children}
        </AutoLogoutContext.Provider>
    )
}
