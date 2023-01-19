import React, { useEffect, useRef } from "react"
import { AppStateStatus, AppState as _Appstate } from "react-native"
import { updateAppState, useAppDispatch } from "~Storage/Caches"

/**
 * @name AppState
 * @description Determines the current and previous app state and saves it in cache
 * @returns void JSX.Element
 */
export const AppState = () => {
    const dispatch = useAppDispatch()
    const appState = useRef(_Appstate.currentState)

    useEffect(() => {
        let previousAppState: AppStateStatus
        const subscription = _Appstate.addEventListener(
            "change",
            nextAppState => {
                previousAppState = appState.current
                appState.current = nextAppState
                dispatch(
                    updateAppState({
                        currentState: nextAppState,
                        previousState: previousAppState,
                    }),
                )
            },
        )

        return () => {
            subscription.remove()
        }
    }, [dispatch])

    return <></>
}
