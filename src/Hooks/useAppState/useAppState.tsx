import { useEffect, useRef, useState } from "react"
import { AppStateStatus, AppState as _Appstate } from "react-native"

/**
 * @name AppState
 * @description Determines the current and previous app state and saves it in cache
 * @returns void JSX.Element
 */

export const useAppState = () => {
    const appState = useRef(_Appstate.currentState)

    const [previousState, setPreviousState] =
        useState<AppStateStatus>("unknown")
    const [currentState, setCurrentState] = useState<AppStateStatus>("active")

    useEffect(() => {
        let previousAppState: AppStateStatus
        const subscription = _Appstate.addEventListener(
            "change",
            nextAppState => {
                previousAppState = appState.current
                appState.current = nextAppState

                setCurrentState(nextAppState)
                setPreviousState(previousAppState)
            },
        )

        return () => {
            subscription.remove()
        }
    }, [])

    return { previousState, currentState }
}
