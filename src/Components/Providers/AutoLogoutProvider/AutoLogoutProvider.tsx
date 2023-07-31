import { useEffect, useState } from "react"
import { useAppStateTransitions } from "~Hooks"
import { useAppDispatch } from "~Storage/Redux"
import { debug } from "~Utils"
import RNRestart from "react-native-restart"

type ProviderProps = { children: React.ReactNode }

export const AutoLogoutProvider = ({ children }: ProviderProps) => {
    const dispatch = useAppDispatch()
    const { activeToBackground, backgroundToActive } = useAppStateTransitions()
    const [inactivityStartTime, setInactivityStartTime] = useState<number>(0)

    useEffect(() => {
        if (inactivityStartTime === 0 && activeToBackground) {
            debug("App went to background")
            setInactivityStartTime(Date.now())
        } else if (inactivityStartTime > 0 && backgroundToActive) {
            debug("App is now active")
            // Check if the app was closed for more than 5 minutes
            const now = Date.now()
            const fiveMinutes = 5 * 60 * 1000
            if (now - inactivityStartTime > fiveMinutes) {
                debug("App was inactive for more than 5 minutes. Restarting...")
                RNRestart.Restart()
            }
            setInactivityStartTime(0)
        }
    }, [dispatch, activeToBackground, backgroundToActive, inactivityStartTime])

    return children
}
