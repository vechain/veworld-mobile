import React, { useEffect, useRef } from "react"
import { AppStateStatus, AppState as _Appstate } from "react-native"
import { RealmClass, useCache } from "~Storage"

/**
 * @name AppState
 * @description Determines the current and previous app state and saves it in cache
 * @returns void JSX.Element
 */
export const AppState = () => {
    const cache = useCache()
    const appState = useRef(_Appstate.currentState)

    useEffect(() => {
        let previousAppState: AppStateStatus
        const subscription = _Appstate.addEventListener(
            "change",
            nextAppState => {
                previousAppState = appState.current
                appState.current = nextAppState

                cache.write(() => {
                    cache.create(RealmClass.AppState, {
                        currentState: nextAppState,
                        previousState: previousAppState,
                    })
                })
            },
        )

        return () => {
            subscription.remove()
        }
    }, [cache])

    return <></>
}
