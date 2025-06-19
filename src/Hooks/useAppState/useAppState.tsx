import { useEffect, useRef, useState } from "react"
import { AppStateStatus, NativeEventSubscription, AppState as _Appstate } from "react-native"
import { blockScreen, unblockScreen } from "react-native-background-secure"
import { isAndroid } from "~Utils/PlatformUtils/PlatformUtils"

/**
 * @name AppState
 * @description Determines the current and previous app state and saves it in cache
 * @returns void JSX.Element
 */

export const useAppState = () => {
    const appState = useRef(_Appstate.currentState)

    const [previousState, setPreviousState] = useState<AppStateStatus>("unknown")
    const [currentState, setCurrentState] = useState<AppStateStatus>("active")

    useEffect(() => {
        let previousAppState: AppStateStatus
        let blurSubscription: NativeEventSubscription
        let focusSubscription: NativeEventSubscription
        const subscription = _Appstate.addEventListener("change", nextAppState => {
            previousAppState = appState.current
            appState.current = nextAppState

            setCurrentState(nextAppState)
            setPreviousState(previousAppState)
        })

        //On iOS the backgroud state change for the black screen is handled in AppDelegate.mm
        if (isAndroid()) {
            //Add black screen on android when app goes to background state
            blurSubscription = _Appstate.addEventListener("blur", () => {
                blockScreen()
            })
            //Restore app screen on android when app goes in foreground state
            focusSubscription = _Appstate.addEventListener("focus", () => {
                unblockScreen()
            })
        }

        return () => {
            subscription.remove()
            if (isAndroid()) {
                focusSubscription.remove()
                blurSubscription.remove()
            }
        }
    }, [])

    return { previousState, currentState }
}
